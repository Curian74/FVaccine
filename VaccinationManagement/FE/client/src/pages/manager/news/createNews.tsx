import { SyntheticEvent, useEffect, useRef, useState } from "react";
import NewService from "@/services/NewsService";
import { useNavigate } from "react-router-dom";
import message from '@/helpers/constants/message.json';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import EmployeeService from "@/services/EmployeeService";
import { Employee } from "@/types/employee";
import NewsTypeModal from "@/components/layout/news/NewsTypeModal";
import NewsTypeService from "@/services/NewsTypeService";
import { Dropdown } from "semantic-ui-react";
import { NewsType } from "@/types/newsTypes";
import NewsImageService from "@/services/NewsImageService";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const CreateNews = () => {
  const [nextId, setNextId] = useState("");
  const [modalStatus, setModalStatus] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [employeeUsername, setEmployeeUsername] = useState("");
  const [author, setAuthor] = useState<Employee>();
  const [activeNewsTypes, setActiveNewsTypes] = useState<NewsType[]>([]);
  const [isSubmit, setIsSubmit] = useState(true);
  const [isConfirmationModal, setIsConfirmationModal] = useState(true);

  //image states
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewImg, setPreviewImg] = useState<string[]>([]);
  const [thumbNailPreview, setThumbnailPreview] = useState<string>();
  const [thumbnailUpload, setThumbnailUpload] = useState<File | null>();
  const thumbnailRef = useRef<HTMLInputElement>(null);
  const slideRef = useRef<HTMLInputElement>(null);

  const [selectedNewsType, setSelectedNewsType] = useState<string>("");

  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  //validation
  const validationSchema = Yup.object().shape({
    authorId: Yup.string().default(author?.id),
    content: Yup.string()
      .required("Content is required")
      .test("not-empty", "Content is required", (value) => {
        return !!value?.replace(/<[^>]*>/g, "").trim();
      }),
    title: Yup.string().required("Title is required").trim(),
    preview: Yup.string().required("Preview is required").trim(),
    postDate: Yup.string().required("Post date is required").trim(),
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
    images: Yup.mixed(),
    thumbnail: Yup.string(),
  })

  const getNextWeek = () => {
    const now = new Date();
    now.setDate(now.getDate() + 7);
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      authorId: author?.id,
      content: "",
      title: "",
      preview: "",
      postDate: getCurrentDateTime(),
      expiryDate: getNextWeek(),
      news_Type_Id: "",
    }
  })

  console.log(watch());
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const watchedValues = watch();

  const confirmReset = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmit(false);
    setModalStatus(true);
    setModalMessage(message["MSG 44"]);
    setModalTitle("Confirmation");
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    if (thumbnailRef.current) thumbnailRef.current.value = '';
    if (slideRef.current) slideRef.current.value = '';
    setSelectedNewsType("");
    setUploadedFiles([]);
    setThumbnailPreview('');
    setPreviewImg([]);
    setModalStatus(false);
  }

  const getNextId = async () => {
    try {
      const data = await NewService.GetNextId();
      setNextId(data);
    } catch {
      console.log("Error fetching next id");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const uploaded = Array.from(files);
      setUploadedFiles(uploaded);

      //Generate preview URL
      const previews = uploaded.map(file => URL.createObjectURL(file));
      setPreviewImg(previews);
    }
  };

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

  const onSubmit = async (data: any) => {
    try {
      //Call thumbnail upload api if there is a thumnail to be added 
      if (thumbnailUpload) {
        await uploadThumbnail(thumbnailUpload);
      }

      const response = await NewService.CreateNews(data);

      //Call image upload API if user selects at least an image
      if (uploadedFiles && uploadedFiles.length > 0) {
        const formData = new FormData();
        uploadedFiles.forEach((file) => {
          formData.append('files', file);
        });

        console.log(formData);
        await NewsImageService.UploadNewsImages(response.id, formData);
      }

      setModalMessage(message["MSG 23"])
      setModalTitle("Success");
      setModalStatus(true);
    } catch (error) {
      setModalMessage("Error creating news")
      setModalTitle("Error");
      setModalStatus(true);
    }

    finally {
      setIsConfirmationModal(false);
    }
  };

  const getEmployeeUsernameByEmail = async () => {
    try {
      const data = await EmployeeService
        .GetEmployeeByEmail(localStorage.getItem("email") || "");
      setEmployeeUsername(data.username);
      setAuthor(data);
    }
    catch (error) {
      console.log(error as Error)
    }
  }

  const fetchActiveNewsTypes = async () => {
    try {
      const response: NewsType[] = await NewsTypeService.GetActiveNewsTypes();
      setActiveNewsTypes(response || []);
    } catch (error) {
      console.error("Error fetching positions:", error);
    }
  };

  const handleNewsTypeChange = (_: SyntheticEvent, dropDownProps: { value?: string | number | boolean | (string | number | boolean)[] | undefined }) => {
    const value = dropDownProps.value?.toString() ?? '';
    setValue("news_Type_Id", value, {
      shouldValidate: true
    });
    setSelectedNewsType(value);
  };

  useEffect(() => {
    getNextId();
    getEmployeeUsernameByEmail();
  }, []);

  useEffect(() => {
    if (author) {
      reset({
        ...watchedValues,
        authorId: author.id, // Update the authorId dynamically
      });
    }
  }, [author, reset]);

  return (
    <>
      <div className="flex justify-center items-center min-h-screen">
        {/* Modal  */}
        {modalStatus && (
          <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
            <div className="bg-white min-w-[150px] p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">{modalTitle}</h2>
              <p className="mb-6">{modalMessage}</p>
              <div className="flex justify-end space-x-4">
                {isConfirmationModal ? (
                  <>
                    <button
                      onClick={isSubmit ? handleSubmit(onSubmit) : handleReset}
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
                      if (modalTitle !== "Error") {
                        navigate("/news");
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md"
                  >
                    Ok
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="bg-white w-full max-w-full p-8 rounded-t-lg shadow-lg border-t-2 border-gray-200">
          <h1 className="text-center text-2xl font-bold mb-6">CREATE NEWS</h1>

          <form>
            <input {...register("authorId")} type="hidden"></input>
            <div className="flex space-x-4 mb-4">
              {/* ID Field */}
              <div className="w-1/2">
                <label className="block text-gray-700 font-semibold mb-2">ID</label>
                <input
                  type="text"
                  value={nextId}
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

            <div className="mt-3">
              <label className="block text-gray-700 font-semibold mb-2">
                Upload news image slide:
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                ref={slideRef}
                onChange={handleFileChange}
                className="w-1/2 border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <div className="pt-2">
                <small className="italic font-bold text-sm">Holding Ctrl key to select multiple images</small>
              </div>
              {previewImg.length > 0 && (
                <div className="mt-2">
                  <h4 className="font-semibold">Image slide previews:</h4>
                  <div className="flex space-x-4 mb-3">
                    {previewImg.map((src, index) => (
                      <div key={index} className="w-32 h-32 border rounded overflow-hidden">
                        <img src={src} className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Post Date */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 mt-3">
                Post Date:<span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                {...register("postDate")}
                value={watch("postDate")}
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
                value={watch("expiryDate")}
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
                value={selectedNewsType}
                placeholder="Select a news type"
                style={{ borderColor: errors.news_Type_Id ? 'red' : '' }}
                className="border border-gray-300 p-2 w-1/2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                options={activeNewsTypes.map((newsType) => ({
                  key: newsType.id,
                  value: newsType.id,
                  text: newsType.news_Type_Name
                }))}
                onChange={handleNewsTypeChange}
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
              {errors.preview && (
                <div className="ui pointing red basic label">{errors.preview.message}</div>
              )}
            </div>

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
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
                onClick={handleSubmit(onSubmit)}
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
};

export default CreateNews;