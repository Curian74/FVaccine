import PositionService from "@/services/PositionService";
import { ChangePositionStatus, Position, PositionUpdateRequest } from "@/types/position";
import { useEffect, useState } from "react";
import { Button, Checkbox, Header, Icon, Modal, ModalActions, ModalContent } from "semantic-ui-react";
import message from '@/helpers/constants/message.json';
import axios from "axios";
import React from "react";

interface PositionModalProps {
    refreshActivePositions: () => void;
}

const PositionModal: React.FC<PositionModalProps> = ({ refreshActivePositions }) => {
    const [editMode, setEditMode] = useState(false);
    const [allPositions, setAllPositions] = useState<Position[]>([]);
    const [originalPositions, setOriginalPositions] = useState<Position[]>([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [searchTerm, setSearchTerm] = useState("");
    const [totalEntries, setTotalEntries] = useState(0);
    const [baseStatus, setBaseStatus] = useState(true);
    const [newPosition, setNewPosition] = useState("");

    const [loading, setLoading] = useState(true);
    const [addPositionModal, setAddPositionModal] = useState(false);
    const [confirmModal, setConfirmModal] = useState(false);
    const [service, setService] = useState('');
    const [hasSubmitted, setHasSubmitted] = useState(false);

    // State to manage selected positions
    const [selectedPositions, setSelectedPositions] = useState<Set<string>>(new Set());

    //Message states
    const [modalActionError, setModalActionError] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");
    const [modalStatus, setModalStatus] = useState(false);

    //Variables
    const totalPages = Math.ceil(totalEntries / pageSize);
    const startIndex = (page - 1) * pageSize;
    const displayCount = Math.min(pageSize, totalEntries - startIndex);
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    const fetchPositions = async () => {
        try {
            const query = {
                pageIndex: page,
                pageSize: pageSize,
                searchTerm: searchTerm,
                status: baseStatus,
            };
            const data = await PositionService.GetPositions(query);
            setAllPositions(data.positionList);
            setOriginalPositions(data.positionList);
            refreshActivePositions();
            setTotalEntries(data.totalPositions);
        } catch (err) {
            setError("Failed to load positions data");
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, positionId: string) => {
        const { value } = e.target;
        setAllPositions((prevPositions) =>
            prevPositions.map((pos) =>
                pos.id === positionId ? { ...pos, positionName: value } : pos
            )
        );
    };

    const confirmReset = (e: React.FormEvent) => {
        e.preventDefault();
        setService('reset');
        setModalTitle("Confirmation")
        setModalMessage(message["MSG 44"])
        setConfirmModal(true);
    }

    const confirmStatusChange = (e: React.FormEvent) => {
        e.preventDefault();
        setService('status');
        setModalTitle("Confirmation")
        setModalMessage("Are you sure you want to make inactive/active the selected position(s)?")
        setConfirmModal(true);
    }

    const confirmUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        setService('update');
        setModalTitle("Confirmation")
        setModalMessage(message["MSG 45"])
        setConfirmModal(true);
    }

    const updatePosition = async (e: React.FormEvent) => {
        e.preventDefault();

        const updatedPositions: PositionUpdateRequest[] = allPositions
            .filter((pos) => selectedPositions.has(pos.id))
            .map((pos) => ({
                id: pos.id,
                positionName: pos.positionName,
            }));

        const hasEmptyFields = updatedPositions.some((pos) => !pos.positionName!.trim());
        if (hasEmptyFields) {
            setModalMessage(message["MSG 51"]);
            setModalTitle("Error");
            setModalStatus(true);
            setConfirmModal(false);
            return;
        }

        try {
            await PositionService.UpdatePositions(updatedPositions);
            setModalActionError("");
            setModalMessage(message["MSG 22"]);
            setModalTitle("Success");
            setModalStatus(true);
            setSelectedPositions(new Set());
            refreshActivePositions();
            fetchPositions();

        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message || "Failed to update position. Please try again!";
            setModalMessage(errorMessage);
            setModalTitle("Error");
            setModalStatus(true);
        }

        finally {
            setConfirmModal(false);
        }
    };

    const changePositionStatus = async (e: React.FormEvent) => {
        e.preventDefault();

        const updatedPositions: ChangePositionStatus[] = Array.from(selectedPositions).map((positionId) => ({
            id: positionId,
        }));

        if (updatedPositions.length === 0) {
            return;
        }

        try {
            await PositionService.ChangePositionStatus(updatedPositions);
            fetchPositions();
            setSelectedPositions(new Set());
            refreshActivePositions();
        } catch (error) {
            console.error("Error updating positions:", error);
        }
    };

    const makePositionsActive = async (e: React.FormEvent) => {
        e.preventDefault();

        const updatedPositions: ChangePositionStatus[] = Array.from(selectedPositions).map((positionId) => ({
            id: positionId,
        }));

        if (updatedPositions.length === 0) {
            return;
        }

        try {
            await PositionService.ChangePositionStatus(updatedPositions);
            setSelectedPositions(new Set());
            refreshActivePositions();
            fetchPositions();
        } catch (error) {
            console.error("Error updating positions:", error);
        }
    };

    const resetPositions = (e: React.FormEvent) => {
        e.preventDefault();
        setAllPositions(originalPositions);
        setConfirmModal(false);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedPositions(new Set());
        setSearchTerm(event.target.value);
    };

    const handleLoadStatusChange = async () => {
        setBaseStatus(!baseStatus);
        setSelectedPositions(new Set());
        setPage(1);
    };

    const handlePageChange = async (newPage: number, e: React.FormEvent) => {
        e.preventDefault();
        setSelectedPositions(new Set());
        setPage(newPage);
    };

    const toggleSelectAll = () => {
        if (selectedPositions.size === allPositions.length) {
            // Deselect all and reset to original values
            const resetPositions = allPositions.map((pos) => {
                const originalPos = originalPositions.find(o => o.id === pos.id);
                return originalPos ? { ...originalPos } : pos;
            });

            setAllPositions(resetPositions);
            setSelectedPositions(new Set());
        } else {
            // Select all
            const newSelected = new Set(allPositions.map((pos) => pos.id));
            setSelectedPositions(newSelected);
        }
    };


    const togglePositionSelection = (positionId: string) => {
        const newSelected = new Set(selectedPositions);
        const updatedPositions = allPositions.map((pos) => {
            if (pos.id === positionId) {
                if (newSelected.has(positionId)) {
                    // Untick: reset to original position value
                    newSelected.delete(positionId);
                    const originalPos = originalPositions.find(o => o.id === positionId);
                    return originalPos ? { ...originalPos } : pos;
                } else {
                    // Tick: add to selected set
                    newSelected.add(positionId);
                }
            }
            return pos;
        });

        setAllPositions(updatedPositions);
        setSelectedPositions(newSelected);
    };

    const togglePositionModal = (e?: React.MouseEvent) => {
        e?.preventDefault();
        setBaseStatus(true);
        setPage(1);
        setNewPosition("");
        setSelectedPositions(new Set());
        setModalMessage("");
        setModalActionError("");
        setEditMode(false);
        setAddPositionModal(!addPositionModal);
    };

    const handlePositionName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewPosition(e.target.value);
    };

    const validatePosition = () => {
        setHasSubmitted(true);
        if (!newPosition.trim()) {
            setModalActionError("This field is required");
            return false;
        }
        setModalActionError("");
        return true;
    };

    useEffect(() => {
        if(hasSubmitted) validatePosition();
    }, [newPosition])

    const fetchActivePositons = async () => {
        try {
            const response: Position[] = await PositionService.GetActivePositions();
            console.log(response);
        } catch (error) {
            console.error("Error fetching positions:", error);
        }
    };

    const addPosition = async (e?: React.MouseEvent) => {
        setModalActionError("");
        e?.preventDefault(); // Prevent form submission
        try {
            const positionData = {
                employeePositionName: newPosition,
            };

            const response = await axios.post(`${baseUrl}/Position`, positionData);

            if (response.status === 200 || response.status === 201) {
                await fetchActivePositons();
                await fetchPositions();
                setModalMessage(message["MSG 23"]);
                setModalTitle("Success");
                setModalStatus(true);
                setNewPosition("");
            }
        }

        catch (error: any) {
            const errorMessage =
                error.response?.data?.message || "Failed to add position. Please try again!";
            setModalMessage(errorMessage);
            setModalTitle("Error");
            setModalStatus(true);
        }

        finally {
            setHasSubmitted(false);
        }
    };

    useEffect(() => {
        fetchPositions();
        setModalMessage("");
    }, [page, pageSize, searchTerm, baseStatus, addPositionModal]);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>
    }

    return (
        <>
            {modalStatus && (
                <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-50 z-[9999]">
                    <div className="bg-white min-w-[150px] p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold mb-4">{modalTitle}</h2>
                        <p className="mb-6">{modalMessage}</p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setModalStatus(false)}
                                className="px-4 py-2 rounded-md bg-blue-600 text-white"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={togglePositionModal}
                className="mx-6 focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
                type="button">
                <p className="font-medium">Manage Positions</p>
            </button>
            {addPositionModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="relative p-4 w-full max-w-6xl">
                        <div className="relative bg-white rounded-lg shadow">
                            <div className="flex items-center justify-between p-4 border-b rounded-t">
                                <h3 className="flex justify-center text-xl font-semibold text-gray-900">
                                    Manage Positions
                                </h3>
                                <button
                                    onClick={togglePositionModal}
                                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                                >
                                    <svg
                                        className="w-3 h-3"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 14 14"
                                    >
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                        />
                                    </svg>
                                    <span className="sr-only">Close modal</span>
                                </button>
                            </div>

                            <div className="p-4 space-y-4">
                                {/* Existing Positions*/}
                                <div className="mb-6">
                                    <label className="flex justify-center text-xl font-medium">Existing Positions</label>

                                    {/* Entries selector */}
                                    <div>
                                        <label htmlFor="entries" className="mr-2">Showing</label>
                                        <select
                                            name="entries"
                                            className="border rounded p-1"
                                            onChange={(e) => {
                                                setSelectedPositions(new Set());
                                                setPageSize(parseInt(e.target.value));
                                                setPage(1);
                                            }}
                                            value={pageSize}
                                        >
                                            <option value="5">5</option>
                                            <option value="10">10</option>
                                            <option value="15">15</option>
                                        </select>
                                        <span className="ml-2">entries</span>
                                    </div>

                                    <div className="flex justify-end items-center gap-4 mt-4">
                                        <div className="flex items-center">
                                            <label className="mr-2">{baseStatus ? "Active" : "Inactive"}</label>
                                            <Checkbox toggle onClick={handleLoadStatusChange} checked={baseStatus} />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search by name..."
                                            className="border p-1 rounded"
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                        />
                                    </div>

                                    <div className="border border-gray-300 rounded-md mt-4">
                                        <div className="overflow-y-auto" style={{ maxHeight: "200px" }}>
                                            <table className="min-w-full text-left text-md text-black-900">
                                                <thead className="bg-gray-100 text-xs uppercase text-gray-700">
                                                    <tr>
                                                        <th scope="col" className="p-3">
                                                            <input
                                                                type="checkbox"
                                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                                                checked={selectedPositions.size === allPositions.length && selectedPositions.size > 0}
                                                                onChange={toggleSelectAll}
                                                            />
                                                        </th>
                                                        <th scope="col" className="p-3">Id</th>
                                                        <th scope="col" className="p-3">Name</th>
                                                        <th scope="col" className="p-3">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {allPositions.map((pos) => (
                                                        <tr key={pos.id} className="shadow overflow-hidden rounded border-b border-gray-200">
                                                            <td className="p-3">
                                                                <input
                                                                    type="checkbox"
                                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                                                    checked={selectedPositions.has(pos.id)}
                                                                    onChange={() => togglePositionSelection(pos.id)}
                                                                />
                                                            </td>
                                                            <td className="p-3 text-md">{pos.id}</td>
                                                            <td className="p-3">
                                                                <input
                                                                    onChange={(e) => handleInputChange(e, pos.id)}
                                                                    disabled={!editMode || !selectedPositions.has(pos.id)}
                                                                    value={pos.positionName}
                                                                    className={`border rounded p-2 text-md transition duration-200 ease-in-out 
                                                                    ${editMode && selectedPositions.has(pos.id)
                                                                            ? "bg-white border-blue-500 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                                                                            : "bg-gray-200 opacity-70"}`}
                                                                />
                                                            </td>
                                                            <td className="p-3">
                                                                <span
                                                                    className={`px-2 py-1 rounded-full text-md ${pos.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                                                                >
                                                                    {pos.status ? "Active" : "Inactive"}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>



                                    <div className="flex justify-between items-center mt-4">
                                        <div>
                                            Showing {startIndex + 1} to {startIndex + displayCount} of {totalEntries} entries
                                        </div>

                                        <div className="flex justify-center">
                                            <input
                                                type="checkbox"
                                                onChange={() => setEditMode((x) => !x)}
                                                className="mr-2"
                                                checked={editMode}
                                            />{" "}
                                            <p className="text-xl">Edit mode</p>
                                        </div>

                                        <div className="mt-4 flex justify-end">
                                            <nav>
                                                <ul className="inline-flex items-center -space-x-px">
                                                    <li>
                                                        <button
                                                            onClick={(e) => handlePageChange(page - 1, e)}
                                                            disabled={page === 1}
                                                            className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700"
                                                        >
                                                            «
                                                        </button>
                                                    </li>
                                                    {Array.from({ length: totalPages }, (_, index) => (
                                                        <li key={index}>
                                                            <button
                                                                onClick={(e) => handlePageChange(index + 1, e)}
                                                                className={`px-3 py-2 leading-tight border ${page === index + 1
                                                                    ? 'bg-gray-500 text-white'
                                                                    : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-100 hover:text-gray-700'
                                                                    }`}>
                                                                {index + 1}
                                                            </button>
                                                        </li>
                                                    ))}

                                                    <li>
                                                        <button
                                                            onClick={(e) => handlePageChange(page + 1, e)}
                                                            disabled={page === totalPages}
                                                            className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700"
                                                        >
                                                            »
                                                        </button>
                                                    </li>
                                                </ul>
                                            </nav>
                                        </div>
                                    </div>

                                    <div>
                                        <Button
                                            onClick={confirmStatusChange}
                                            color={"green"} disabled={selectedPositions.size == 0}>
                                            {baseStatus ? "Make Inactive" : "Make Active"}
                                        </Button>
                                        {editMode && (
                                            <>
                                                <Button disabled={selectedPositions.size == 0}
                                                    onClick={confirmUpdate} primary>Save</Button>
                                                <Button disabled={selectedPositions.size == 0}
                                                    onClick={(e) => confirmReset(e)} color="red">Reset</Button>
                                            </>

                                        )}
                                    </div>

                                </div>
                                {/* Divider */}
                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 text-gray-500 bg-white">OR</span>
                                    </div>
                                </div>

                                {/* Add New Position Section */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium">
                                        Add New Position <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newPosition}
                                        onChange={handlePositionName}
                                        style={{ borderColor: modalActionError ? 'red' : '' }}
                                        className="border border-gray-300 p-2 w-1/2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter position name"
                                    />
                                </div>
                                {modalActionError && (
                                    <div className="ui pointing red basic label mt-2 ml-3">{modalActionError}</div>
                                )}
                            </div>
                            <div className="flex items-center p-4 border-t border-gray-200 rounded-b">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        if (validatePosition()) {
                                            addPosition(e);
                                        }
                                    }}
                                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3"
                                >
                                    Add
                                </button>
                                <button
                                    type="button"
                                    onClick={togglePositionModal}
                                    className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10"
                                >
                                    Cancel
                                </button>
                            </div>
                            <Modal
                                size="tiny"
                                open={confirmModal}
                                onClose={() => setConfirmModal(false)}>
                                <Header content="Confirmation" />
                                <ModalContent>
                                    <p>{modalMessage}</p>
                                </ModalContent>
                                <ModalActions>
                                    <Button color="red" onClick={() => setConfirmModal(false)}>
                                        <Icon name="remove" /> No
                                    </Button>
                                    <Button
                                        color="green"
                                        onClick={(e) => {
                                            if (service === "reset") {
                                                resetPositions(e);
                                            }

                                            else if (service === 'status') {
                                                if (baseStatus) changePositionStatus(e);
                                                else makePositionsActive(e);
                                                setConfirmModal(false);
                                            }

                                            else if (service === 'update') {
                                                updatePosition(e);
                                            }
                                        }}
                                    >
                                        <Icon name="checkmark" /> Yes
                                    </Button>
                                </ModalActions>
                            </Modal>
                        </div>
                    </div>
                </div >
            )}
        </>
    );
};

export default PositionModal;
