import React, { useEffect, useRef, useState } from "react";
import NewService from "@/services/NewsService";
import { useNavigate, useParams } from "react-router-dom";
import message from '@/helpers/constants/message.json';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { Dropdown } from "semantic-ui-react";
import { NewsType } from "@/types/newsTypes";
import NewsTypeModal from "@/components/layout/news/NewsTypeModal";
import NewsTypeService from "@/services/NewsTypeService";
import EmployeeService from "@/services/EmployeeService";
import NewsImageService from "@/services/NewsImageService";
import { NewsImage } from "@/types/newsImage";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const UpdateNews = () => {
    const [modalStatus, setModalStatus] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");
    const [activeNewsTypes, setActiveNewsTypes] = useState<NewsType[]>([]);
    const [newsId, setNewsId] = useState("");
    const [employeeUsername, setEmployeeUsername] = useState("");
    const [newsTypeId, setNewsTypeId] = useState("");
    const [isConfirmationModal, setIsConfirmationModal] = useState(true);
    const [isUpdating, setIsUpdating] = useState(true);
    const thumbnailRef = useRef<HTMLInputElement>(null);
    const slideRef = useRef<HTMLInputElement>(null);

    const [newsImages, setNewsImages] = useState<NewsImage[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [previewImg, setPreviewImg] = useState<string[]>([]);
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
    const [thumbNailPreview, setThumbnailPreview] = useState<string>();
    const [thumbnailUpload, setThumbnailUpload] = useState<File | null>();

    //Validations
    const validationSchema = Yup.object().shape({
        content: Yup.string()
            .required("Content is required")
            .test("not-empty", "Content is required", (value) => {
                return !!value?.replace(/<[^>]*>/g, "").trim();
            }),
        title: Yup.string().required("Title is required").trim(),
        preview: Yup.string().required("Preview is required").trim(),
        postDate: Yup.string().required("Post date is required"),
        expiryDate: Yup.string()
            .required("Expiry date is required")
            .test("expiry", "Expiry date must be later than post date", function (value) {
                const { postDate } = this.parent;
                if (!postDate || !value) return false;

                const post = new Date(postDate);
                const expiry = new Date(value);

                return expiry > post;
            }),
        news_Type_Id: Yup.string().required("News type is required"),
        thumbnail: Yup.string(),
    });

    const { register, handleSubmit, formState: { errors, isValid }, watch, reset, setValue } = useForm({
        resolver: yupResolver(validationSchema),
    })

    const { id } = useParams();
    const navigate = useNavigate();
    const baseUrl = import.meta.env.VITE_BASE_URL;

    const fetchNewsData = async () => {
        const data = await NewService.GetNewsById(id);

        //Get author
        const employeeId = data.authorId;

        const getEmployeeById = await EmployeeService.GetEmployeeById(employeeId);

        setEmployeeUsername(getEmployeeById.username);

        //Attach data to form
        reset({
            content: data.content || "",
            title: data.title || "",
            preview: data.preview || "",
            postDate: data.postDate || "",
            expiryDate: data.expiryDate || "",
            news_Type_Id: data.news_Type_Id || "",
            thumbnail: data.thumbnail || "",
        })

        setNewsId(data.id);
        setValue("content", data.content);
        setNewsTypeId(data.news_Type_Id);
    }

    //News Type Handle
    const fetchActiveNewsTypes = async () => {
        try {
            const response: NewsType[] = await NewsTypeService.GetActiveNewsTypes();
            console.log(response);
            setActiveNewsTypes(response || []);
        } catch (error) {
            console.error("Error fetching news types:", error);
        }
    };

    //Image handles
    const fetchImages = async () => {
        try {
            const data = await NewsImageService.GetAllImagesByNewsId(id!);
            setNewsImages(data.newsImages);
        }
        catch (error: any) {
            console.log(error.response.message)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const uploaded = Array.from(files);
            setUploadedFiles(uploaded);

            // Generate preview URLs for new uploads
            const previews = uploaded.map(file => URL.createObjectURL(file));
            setPreviewImg(previews);
        }
    };

    const handleDeleteImage = (id: string) => {
        setImagesToDelete((p) => [...p, id]);
        setNewsImages(() => newsImages.filter((p) => p.id !== id))
    }

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files![0];

        if (!file) {
            setThumbnailPreview("");
            setThumbnailUpload(undefined);
            return;
        }

        // Check if file is an image
        if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/i)) {
            e.target.value = '';
            setThumbnailPreview("");
            setThumbnailUpload(undefined);
            return;
        }

        setThumbnailPreview(URL.createObjectURL(file));
        setThumbnailUpload(file);
    }

    const uploadThumbnail = async (file: File) => {
        try {
            const data = await NewService.UploadThumbnail(file);
            setValue("thumbnail", data);
        }

        catch (error) {
            console.log(error);
        }
    }

    const onUpdate = async (formData: any) => {
        setModalStatus(false);
        try {
            //Call delete img api if there are images to be deleted
            if (imagesToDelete) {
                await NewsImageService.DeleteImages(imagesToDelete);
            }

            //Call thumbnail upload api if there is a thumnail to be added
            if (thumbnailUpload) {
                await uploadThumbnail(thumbnailUpload);
            }

            //Call upload img api if there are images to be added
            if (uploadedFiles.length > 0) {
                const imageFormData = new FormData();
                uploadedFiles.forEach((file) => {
                    imageFormData.append("files", file);
                });

                await NewsImageService.UploadNewsImages(id!, imageFormData);
            }
            await NewService.UpdateNews(id, formData);
            setModalMessage(message["MSG 22"]);
            setModalTitle("Success");
            setIsConfirmationModal(false);
            setModalStatus(true);
        } catch (error) {
            console.error("Error updating news:", error);
            setModalMessage("Failed to update");
            setModalTitle("Error");
            setIsConfirmationModal(false);
            setModalStatus(true);
        }
    };

    const handleSaveButton = () => {
        if (!isValid) return;
        setModalTitle("Confirmation");
        setModalMessage("Are you sure you want to update news?");
        setIsConfirmationModal(true);
        setIsUpdating(true);
        setModalStatus(true);
    }

    const confirmReset = (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(false);
        setModalStatus(true);
        setModalMessage(message["MSG 44"]);
        setModalTitle("Confirmation");
    }

    const handleResetButton = () => {
        if (thumbnailRef.current) thumbnailRef.current.value = ''
        if (slideRef.current) slideRef.current.value = ''
        setImagesToDelete([]);
        setUploadedFiles([]);
        setPreviewImg([]);
        setThumbnailPreview("");
        setThumbnailUpload(null);
        fetchNewsData();
        fetchImages();
        setModalStatus(false);
    }

    useEffect(() => {
        fetchNewsData();
        fetchImages();
    }, [id, reset]);

    return (
        <>
            <div className="flex justify-center items-center min-h-screen">
                {/* Modal */}
                {modalStatus && (
                    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
                        <div className="bg-white min-w-[150px] p-6 rounded-lg shadow-lg">
                            <h2 className="text-xl font-semibold mb-4">{modalTitle}</h2>
                            <p className="mb-6">{modalMessage}</p>
                            <div className="flex justify-end space-x-4">
                                {isConfirmationModal ? (
                                    <>
                                        <button
                                            onClick={isUpdating ? handleSubmit(onUpdate) : handleResetButton}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md">
                                            Confirm
                                        </button>
                                        <button
                                            onClick={() => setModalStatus(false)}
                                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md">
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setModalStatus(false);
                                            if (modalTitle === "Success") {
                                                navigate("/news");
                                            }
                                        }}
                                        className={`px-4 py-2 rounded-md ${modalTitle === "Success"
                                            ? "bg-blue-600 text-white"
                                            : "bg-red-600 text-white"
                                            }`}
                                    >
                                        OK
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white w-full max-w-full p-8 rounded-t-lg shadow-lg border-t-2 border-gray-200">
                    <h1 className="text-center text-2xl font-bold mb-6">UPDATE NEWS</h1>
                    <form>
                        <div className="flex space-x-4 mb-4">
                            {/* ID Field */}
                            <div className="w-1/2">
                                <label className="block text-gray-700 font-semibold mb-2">ID</label>
                                <input
                                    type="text"
                                    value={newsId}
                                    className="w-1/2 border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    disabled
                                />
                            </div>

                            {/* Author Field */}
                            <div className="w-1/2">
                                <label className="block text-gray-700 font-semibold mb-2">Author</label>
                                <input
                                    type="text"
                                    value={employeeUsername}
                                    className="w-1/2 border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    disabled
                                />
                            </div>
                        </div>

                        {/* Add Image Section */}
                        <div className="mt-3">

                            <div className="mb-3">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Thumbnail:
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={thumbnailRef}
                                    onChange={handleThumbnailChange}
                                    className="w-1/2 border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />

                                {(thumbNailPreview || watch("thumbnail")) && (
                                    <img
                                        src={thumbNailPreview || `${baseUrl}/${watch("thumbnail")}`}
                                        className="w-2/4 h-full object-cover mt-3"
                                        alt="Thumbnail Preview"
                                    />
                                )}

                            </div>

                            <label className="block text-gray-700 font-semibold mb-2">
                                Current image slide:
                            </label>
                            <div className="flex flex-wrap gap-4 mb-4">
                                {/* Current Images */}
                                {newsImages.map((image) => (
                                    <div key={image.id} className="relative">
                                        <img
                                            src={`${baseUrl}/${image.imagePath}`}
                                            alt="News"
                                            className="w-32 h-32 object-cover rounded shadow"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteImage(image.id)}
                                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 m-1 hover:bg-red-600"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}

                                {/* Preview Images */}
                                {previewImg.length > 0 &&
                                    previewImg.map((src, index) => (
                                        <div key={index} className="relative w-32 h-32 border rounded overflow-hidden shadow">
                                            <img
                                                src={src}
                                                className="w-full h-full object-cover"
                                                alt={`Preview ${index + 1}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newArr = previewImg.filter((_, x) => x !== index);
                                                    setPreviewImg(newArr);
                                                    const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
                                                    setUploadedFiles(updatedFiles);
                                                }}
                                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 m-1 hover:bg-red-600"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                            </div>


                            <label className="block text-gray-700 font-semibold mb-2">
                                Upload new images for slide:
                            </label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                ref={slideRef}
                                onChange={handleFileChange}
                                className="w-1/2 border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />

                        </div>
                        <div className="pt-2">
                            <small className="italic font-bold text-sm">Holding Ctrl key to select multiple images</small>
                        </div>
                        {/* Post Date */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2 mt-3">
                                Post Date:<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                {...register("postDate")}
                                style={{ borderColor: errors.postDate ? 'red' : '' }}
                                className="w-1/2 border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                        {errors.postDate && (
                            <div className="ui pointing red basic label">{errors.postDate.message}</div>
                        )}

                        {/* Expiry Date */}
                        <div className="mt-3">
                            <label className="block text-gray-700 font-semibold mb-2">
                                Expiry Date:<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                {...register("expiryDate")}
                                style={{ borderColor: errors.expiryDate ? 'red' : '' }}
                                className="w-1/2 border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />

                        </div>
                        {errors.expiryDate && (
                            <div className="ui pointing red basic label">{errors.expiryDate.message}</div>
                        )}

                        <div className="mt-3">
                            <label className="block text-gray-700 font-semibold mb-2">
                                News Type:<span className="text-red-500">*</span>
                            </label>
                            <Dropdown
                                {...register("news_Type_Id")}
                                search
                                selection
                                placeholder="Select a news type"
                                style={{ borderColor: errors.news_Type_Id ? 'red' : '' }}
                                className="border border-gray-300 p-2 w-1/2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                options={activeNewsTypes.map((newsType) => ({
                                    key: newsType.id,
                                    value: newsType.id,
                                    text: newsType.news_Type_Name
                                }))}
                                value={newsTypeId}
                                onChange={(_, { value }) => {
                                    setValue("news_Type_Id", value as string, { shouldValidate: true });
                                    setNewsTypeId(value as string);
                                }}
                            />
                            <NewsTypeModal refreshActiveNewsType={fetchActiveNewsTypes} />
                        </div>
                        {errors.news_Type_Id && (
                            <div className="ui pointing red basic label">{errors.news_Type_Id.message}</div>
                        )}

                        {/* Title */}
                        <div className="mt-3">
                            <label className="block text-gray-700 font-semibold mb-2">
                                Title:<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                {...register("title")}
                                style={{ borderColor: errors.title ? 'red' : '' }}
                                className="w-1/2 border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Enter the news title"
                            />
                        </div>
                        {errors.title && (
                            <div className="ui pointing red basic label">{errors.title.message}</div>
                        )}

                        {/* Preview */}
                        <div className="mt-3">
                            <label className="block text-gray-700 font-semibold mb-2">
                                Preview:<span className="text-red-500">*</span>
                            </label>
                            <textarea
                                {...register("preview")}
                                style={{ borderColor: errors.preview ? 'red' : '' }}
                                className="w-full border border-gray-300 rounded p-2 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Enter a preview of the news"
                            />
                        </div>
                        {errors.preview && (
                            <div className="ui pointing red basic label">{errors.preview.message}</div>
                        )}

                        {/* Content */}
                        <div className="mb-4 mt-3">
                            <label className="block text-gray-700 font-semibold mb-2">
                                Content:<span className="text-red-500">*</span>
                            </label>
                            <ReactQuill
                                value={watch("content")}
                                theme="snow"
                                onChange={(val) => setValue("content", val, { shouldValidate: true })}
                                className={`editor ${errors.content ? "border-red-500" : "border-gray-300"}`}
                            />

                            {errors.content && (
                                <div className="ui pointing red basic label">{errors.content.message}</div>
                            )}
                        </div>


                        {/* Buttons */}
                        <div className="flex justify-start space-x-4">
                            <button
                                type="button"
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
                                onClick={handleSubmit(handleSaveButton)}
                            >
                                Save
                            </button>
                            <button
                                type="button"
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
                                onClick={(e) => confirmReset(e)}
                            >
                                Reset
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate("/news")}
                                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition duration-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );

}

export default UpdateNews;