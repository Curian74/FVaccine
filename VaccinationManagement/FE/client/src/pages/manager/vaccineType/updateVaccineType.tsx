import VaccineTypeService from "@/services/VaccineTypeService";
import { VaccineType } from "@/types/vaccineType";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom";
import { Button, Checkbox, Form, Loader, Message } from "semantic-ui-react";
import { useForm } from "react-hook-form";
import message from "@/helpers/constants/message.json"
const baseUrl = import.meta.env.VITE_BASE_URL;

type UpdateVaccineType = {
    name: string;
    description?: string;
}

const validationSchema = Yup.object().shape({
    name: Yup.string().required("Vaccine Type Name is required"),
    description: Yup.string()
        .max(255, "Description cannot be more than 255 characters"),
});

const UpdateVaccineType = () => {
    const [code, setCode] = useState('');
    const [active, setActive] = useState(true);
    const [image, setImage] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [isPopupVisible, setPopupVisible] = useState(false);
    const [popupForm, setPopupForm] = useState("");
    const [popupMessage, setPopupMessage] = useState('');

    const { id } = useParams<{ id: string }>();
    const [vaccine, setVaccine] = useState<VaccineType | null>(null);



    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: yupResolver(validationSchema),
    });

    useEffect(() => {
        const fetchVaccines = async () => {
            const data = await VaccineTypeService.GetVaccineTypeById(id!);
            setVaccine(data);
            setCode(data.id);
            setActive(data.status);
            setImageUrl(data.image ? baseUrl + data.image : "");

            reset({
                name: data.vaccine_Type_Name,
                description: data.description,
            });
        };
        fetchVaccines();
    }, [id, reset]);

    const nav = useNavigate();



    const handleSubmitForm = async (data: UpdateVaccineType) => {
        setLoading(true);
        setError(null);

        try {
            let updateImageUrl = '';
            if (image) {
                const formData = new FormData();
                formData.append('file', image);

                const imageResponse = await VaccineTypeService.UploadImage(formData);
                updateImageUrl = imageResponse.path;
            }
            const payload: VaccineType = {
                id: code,
                vaccine_Type_Name: data.name,
                description: data.description || "",
                status: active,
                image: updateImageUrl ? updateImageUrl : vaccine?.image
            };
            await VaccineTypeService.UpdateVaccineType(payload);
            setSuccess(true);
            setLoading(false);
            setPopupMessage(message["MSG 22"]);
            setPopupForm('confirm');
            setPopupVisible(true);

        } catch (err) {
            setError((err as Error)?.message);
            setLoading(false);
        }

    }

    const handleConfirmAction = () => {
        setPopupVisible(false);
        nav("/vaccineType");
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];

        if (!file!.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/i)) {
            e.target.value = '';
            setImage(null)
            setImageUrl("")
            return;
        }

        if (file) {
            setImage(file);
            const previewURL = URL.createObjectURL(file);
            setImageUrl(previewURL);
        }
    };

    const handleToggleReset = () => {
        setPopupMessage(message["MSG 44"]);
        setPopupForm('reset')
        setPopupVisible(true);
    }
    const handleToggleSubmit = () => {
        setPopupMessage(message["MSG 45"]);
        setPopupForm('save');
        setPopupVisible(true);
    }

    const handleClose = () => {
        setPopupVisible(false);
    }

    const handleReset = () => {
        reset();
        setActive(true);
        setImage(null);
        setImageUrl(baseUrl + vaccine?.image);
        setError(null);
        setSuccess(false);
        setPopupVisible(false);
    }

    if (!vaccine) return <Loader active inline='centered'></Loader>

    return (
        <div className="ui container">
            <h1 className="ui header text-center"> Update Vaccine Type</h1>
            <div className='bg-white p-4 rounded-lg shadow'>
                <Form loading={loading} success={success} error={!!error}>
                    <Form.Group>
                        <Form.Field>
                            <label>Vaccine Type Code <span className="text-red-500">(*)</span></label>
                            <input value={code}
                                readOnly
                                style={{ width: '350px' }} />
                        </Form.Field>
                        <Form.Field>
                            <label>Vaccine Type Name <span className="text-red-500">(*)</span></label>
                            <input placeholder="Vaccine Type Name"
                                {...register("name")}
                                className={`block w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} 
                           rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-indigo-500`}
                            />
                            {errors.name && (
                                <div className="ui pointing red basic label">{errors.name.message}</div>
                            )}
                        </Form.Field>
                        <Form.Field>
                            <label>Status</label>
                            <Checkbox
                                label='Active'
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
                    <Message success header="Success!" content="Vaccine Type Save Successfully."></Message>
                    <Message error header="Error!" content={error}></Message>
                    <Button color="green" type="submit" onClick={handleSubmit(() => {
                        handleToggleSubmit();
                    })}>Save</Button>
                    <Button color="blue" type="button" onClick={handleToggleReset}>Reset</Button>
                    <Button color="orange" onClick={() => nav("/vaccineType")}>Cancel</Button>
                </Form>
            </div>

            {isPopupVisible && (
                <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <p>{popupMessage}</p>
                        <div className="mt-4 flex justify-end">
                            {popupForm == 'save'
                                && <>
                                    <button
                                        className="px-4 py-2 bg-green-500 text-white rounded mr-2"
                                        onClick={handleSubmit(handleSubmitForm)}
                                    >
                                        Yes
                                    </button>
                                    <button
                                        className="px-4 py-2 bg-red-500 text-white rounded"
                                        onClick={handleClose}
                                    >
                                        No
                                    </button>
                                </>}
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
    )

}
export default UpdateVaccineType