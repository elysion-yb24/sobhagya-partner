'use client';
import IconX from '@/components/icon/icon-x';
import { Transition, Dialog } from '@headlessui/react';
import React, { Fragment, useState } from 'react';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { updateTeamMemberPermissions, updateTeamMemberRole } from '@/utils'
import Cookies from 'universal-cookie';
import { useRouter } from 'next/navigation';
import Dropdown from '../dropdown';

const ComponentTeamPermissionRole = ({ userId, role }) => {
    const router = useRouter()
    const cookies = new Cookies(null, { path: '/' });
    const { data: userData } = useSelector(store => store.user)
    const [selectedRole, setSelectedRole] = useState('')

    // console.log("🚀 ~ ComponentTeamPermissionModal ~ permissionArr:", permissionArr)
    const MySwal = withReactContent(Swal);
    const handleRole = () => {
        if (userData?.role?.toLowerCase() !== 'admin') {
            MySwal.fire({
                title: 'You are not Authorized to do this action',
                toast: true,
                position: 'top',
                showConfirmButton: false,
                timer: 3000,
                showCloseButton: true,
                background:"red"
            });
        }
        else setModal2(true)
    }

    const handleSelectedRole = async (e) => {
        e.preventDefault()
        // console.log(updatedPermissions)

        if(selectedRole===role){
            MySwal.fire({
                title: 'Current Role and Selected Role are same',
                toast: true,
                position: 'top',
                showConfirmButton: false,
                timer: 3000,
                showCloseButton: true,
                background:'red'
            });
            return;
        }
        
        // call api
        const responseData = await updateTeamMemberRole({ userId, role: selectedRole, adminId: userData?._id }, cookies)
        if (responseData.success) {
            MySwal.fire({
                title: responseData.message,
                toast: true,
                position: 'top',
                showConfirmButton: false,
                timer: 3000,
                showCloseButton: true,
                background:'green'
            });
            setModal2(false)
            window.location.reload()
        } else {
            MySwal.fire({
                title: responseData.message,
                toast: true,
                position: 'top',
                showConfirmButton: false,
                timer: 3000,
                showCloseButton: true,
                background:'red'
            });
        }
        // console.log("🚀 ~ handlePermissionsForm ~ data:", responseData)
    }
    const [modal2, setModal2] = useState(false);
    return (
        <div>
            <div className="flex items-center justify-center">
                <button type="button" onClick={handleRole} className="btn btn-secondary">
                    Manage Role
                </button>
            </div>
            <Transition appear show={modal2} as={Fragment}>
                <Dialog as="div" open={modal2} onClose={() => setModal2(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0" />
                    </Transition.Child>
                    <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
                        <div className="flex min-h-screen items-center justify-center px-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel as="div" className="panel my-8 w-full max-w-lg  rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <h5 className="text-lg font-bold">Manage Role</h5>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setModal2(false)}>
                                            <IconX />
                                        </button>
                                    </div>
                                    <div className="p-5">
                                        <div className='flex justify-between'>
                                            <div className="dropdown w-1/2">
                                                <Dropdown
                                                    placement="bottom-start"
                                                    // placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                                    btnClassName="btn btn-outline-primary dropdown-toggle"
                                                    button={<>Change Role</>}
                                                >
                                                    <ul className='w-full'>
                                                        <li>
                                                            <button type="button" onClick={() => setSelectedRole('admin')}>
                                                                Admin
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button type="button" onClick={() => setSelectedRole('regionalManager')}>
                                                                Regional Manager
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button type="button" onClick={() => setSelectedRole('support')}>
                                                                Support
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button type="button" onClick={() => setSelectedRole('')}>
                                                                Not Assigned
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </Dropdown>
                                            </div>

                                            <div>
                                                <div>Current Role</div>
                                                <div className="flex items-center justify-center">
                                                    <span className="badge badge-outline-primary rounded-full">{role ? role : 'N/A'}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <div>Updated Role</div>
                                                <div className="flex items-center justify-center">
                                                    <span className="badge badge-outline-primary rounded-full">{selectedRole ? selectedRole : 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-8 flex items-center justify-end">
                                            <button type="button" className="btn btn-outline-danger" onClick={() => setModal2(false)}>
                                                Discard
                                            </button>
                                            <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={handleSelectedRole}>
                                                Update
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default ComponentTeamPermissionRole;
