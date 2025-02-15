import VaccineTypeService from "@/services/VaccineTypeService";
import { VaccineType } from "@/types/vaccineType";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Checkbox, Form, Message } from "semantic-ui-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import message from "@/helpers/constants/message.json"
import * as Yup from "yup";
// const baseUrl = import.meta.env.VITE_BASE_URL;
type CreateVaccineType = {
    name: string;
    description?: string;
}

const validationSchema = Yup.object().shape({
    name: Yup.string().required("Vaccine Type Name is required"),
    description: Yup.string()
        .max(255, "Description cannot be more than 255 characters"),
});

const CreateVaccineType = () => {
    const [code, setCode] = useState('');
    const [active, setActive] = useState(true);
    const [image, setImage] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [popupForm, setPopupForm] = useState("");


    const nav = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: yupResolver(validationSchema),
    });

    const handleClose = () => {
        setPopupVisible(false);
    }

    const handleReset = () => {
        reset();
        setActive(true);
        setImage(null);
        setImageUrl(null);
        setError(null);
        setSuccess(false);
        setPopupVisible(false);
    }

    const handleSubmitForm = async (data: CreateVaccineType) => {
        setLoading(true);
        setError(null);

        try {
            let uploadedImageUrl = '';

            if (image) {
                const formData = new FormData();
                formData.append('file', image);
                const imageResponse = await VaccineTypeService.UploadImage(formData);
                uploadedImageUrl = imageResponse.path;
            }

            const payload: VaccineType = {
                id: code,
                vaccine_Type_Name: data.name,
                description: data.description,
                status: active,
                image: uploadedImageUrl ? uploadedImageUrl : imageUrl || ''
            };

            await VaccineTypeService.CreateVaccineType(payload);
            setSuccess(true);
            setLoading(false);
            setPopupMessage(message["MSG 23"]);
            setPopupForm('confirm');
            setPopupVisible(true);
        } catch (err) {
            setError((err as Error)?.message);
            setLoading(false);
        }
    }

    useEffect(() => {
        const fetchVaccineType = async () => {
            try {
                const id = await VaccineTypeService.GetLastVaccineType();

                console.log(id);

                const prefix = id.slice(0, 2);
                const suffix = id.slice(2);

                const nextSuffix = (parseInt(suffix, 10) + 1).toString();
                const paddedSuffix = nextSuffix.padStart(id.length - 2, '0');

                const nextCode = `${prefix}${paddedSuffix}`;
                setCode(nextCode);
            } catch (err) {
                console.error(err);
            }
        };
        fetchVaccineType();
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];

        if (!file!.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/i)) {
            e.target.value = "";
            setImageUrl("");
            setImage(null)
            return;
        }

        if (file) {
            setImage(file)
            const previewURL = URL.createObjectURL(file);
            setImageUrl(previewURL);
        }
    };

    const handleToggleReset = () => {
        setPopupMessage(message["MSG 44"]);
        setPopupForm('reset')
        setPopupVisible(true);
    }
    

    const handleConfirmAction = () => {
        setPopupVisible(false);
        nav("/vaccineType");
    }


    return (
        <div className="ui container">
            <h1 className="ui header text-center">Create Vaccine Type</h1>
            <div className='bg-white p-4 rounded-lg shadow'>
                <Form onSubmit={handleSubmit(handleSubmitForm)} loading={loading} success={success} error={!!error}>
                    <Form.Group>
                        <Form.Field>
                            <label>Vaccine Type Code <span className="text-red-500"> (*)</span> </label>
                            <input placeholder="Vaccine Type Code" value={code} readOnly style={{ width: '350px' }} />
                        </Form.Field>
                        <Form.Field error={!!errors.name}>
                            <label className="block text-sm font-medium text-gray-700">
                                Vaccine Type Name
                                <span className="text-red-500"> (*)</span>
                            </label>
                            <div className="mt-1 w-96">
                                <input
                                    placeholder="Vaccine Type Name"
                                    {...register("name")}
                                    className={`block w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} 
                                rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-indigo-500`}
                                />
                                {errors.name && (
                                    <div className="ui pointing red basic label">{errors.name.message}</div>
                                )}
                            </div>
                        </Form.Field>

                        <Form.Field>
                            <label>Status</label>
                            <Checkbox
                                label="Active"
                                checked={active}
                                onChange={() => setActive(!active)}
                                className="mt-3"
                            />
                        </Form.Field>
                    </Form.Group>
                    <Form.Field error={!!errors.description}>
                        <label>Description</label>
                        <textarea
                            placeholder="Description"
                            {...register("description")}
                            style={{ borderColor: errors.description ? 'red' : '' }}
                        />
                        {errors.description && (
                            <div className="ui pointing red basic label">{errors.description.message}</div>
                        )}
                    </Form.Field>
                    <Form.Field>
                        <label>Image</label>
                        <input type="file"
                            accept="image/*"
                            onChange={handleImageChange} />
                        {imageUrl && (
                            <img
                                src={imageUrl ? imageUrl : ''}
                                alt="Vaccine Type Image"
                                style={{ width: '100px', height: '100px', marginTop: '10px' }}
                            />
                        )}
                    </Form.Field>
                    <Message success header="Success!" content="Vaccine Type Save Successfully." />
                    <Message error header="Error!" content={error} />
                    <Button color="green" type="submit">Save</Button>
                    <Button color="blue" type="button" onClick={handleToggleReset}>Reset</Button>
                    <Button color="orange" onClick={() => nav("/vaccineType")}>Cancel</Button>
                </Form>
            </div>
            {isPopupVisible && (
                <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <p>{popupMessage}</p>
                        <div className="mt-4 flex justify-end">
                            {popupForm == 'reset' &&
                                <>
                                    <button
                                        className="px-4 py-2 bg-green-500 text-white rounded mr-2"
                                        onClick={handleReset}
                                    >
                                        Yes
                                    </button>
                                    <button
                                        className="px-4 py-2 bg-red-500 text-white rounded"
                                        onClick={handleClose}
                                    >
                                        No
                                    </button>
                                </>
                            }
                            {popupForm == 'confirm' &&
                                <>
                                    <button
                                        className="px-4 py-2 bg-green-500 text-white rounded mr-2"
                                        onClick={handleConfirmAction}
                                    >
                                        OK
                                    </button>
                                </>
                            }

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default CreateVaccineType;
