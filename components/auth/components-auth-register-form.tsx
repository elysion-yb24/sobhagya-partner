'use client';
import IconUser from '@/components/icon/icon-user';
import { useState,useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ComponentsFormsFileUploadSingle from '../forms/file-upload/components-forms-file-upload-single'; // Import your component
import Image from "next/image";
import { get, LoginSendOtp } from "@/utils";
import Swal from 'sweetalert2';
import Link from 'next/link';


interface FormData {
    name: string;
    yoe: string;
    image: File | null; // Assuming image will be a file object
    gender: string;
    astrologerType: string;
    language: string;
    pan: string;
    aadhaar: string;
    vpa: string;
    panImage: File | null; // Assuming panImage will be a file object
    aadhaarImage: File | null; // Assuming aadhaarImage will be a file object
}


const ComponentsAuthRegisterForm=  () => {
    const router = useRouter();
    const [step, setStep] = useState(1);
    
    const [timer, setTimer] = useState(30);

    const Toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    });

// Step state to control form parts
    const astrologyTypes = [
        "Vedic",
        "Vastu",
        "Tarrot Reading",
        "Reiki Healing",
        "Palmistry",
        "KP",
        "Prashna",
        "Meditation & Mindfulness",
        "Yoga & Meditation",
        "Psychics",
        "Pranic Healing",
        "Feng Shui",
        "Fortune Telling",
        "Face Reading",
        "Numerology",
    ];

    const languages = [
        "Hindi",
        "English",
        "Punjabi",
        "Bengali",
        "Marathi",
        "Tamil",
        "Telugu",
        "Bhojpuri",
        "Malayalam",
        "Kannada",
        "Gujarati",
        "Assamese",
    ];
    
    const [formData, setFormData] = useState({
        phone:"",
        name:"",
        yoe: '',
        image: null,
        gender:"",
        astrologerType: '',
        language: '',
        pan: '',
        aadhaar: '',
        vpa: '',
        panImage: null,
        aadhaarImage: null,
    });

    const [errors, setErrors] = useState({
        phone:"",
        name: false,
        yoe: false,
        image: false,
        gender: false,
        astrologerType: false,
        language: false,
        pan: false,
        aadhaar: false,
        vpa: false,
        panImage: false,
        aadhaarImage: false,
    });
    const [otp, setOtp] = useState(["", "", "", ""]);


    const handleChange = (e: any) => {
        const { name, value, files } = e.target;
        console.log("name " + name + "value:" + value)
        setFormData({
            ...formData,
            [name]: files ? files[0] : value,
        });

        // Resetting the error for the field being modified
        setErrors({
            ...errors,
            [name]: false,
        });
    };

    const validateStep = () => {
        let isValid = true;
        // const newErrors = { ...errors };

        // if (step === 1) {
        //     // Validate step 1 fields
        //     const fieldsToValidate: (keyof FormData)[] = ['name', 'yoe', 'image', 'astrologerType', 'language'];
        //     fieldsToValidate.forEach(field => {
        //         if (!formData[field]) {
        //             newErrors[field] = true;
        //             isValid = false;
        //         }
        //     });
        // } else if (step === 2) {
        //     // Validate step 2 fields
        //     const fieldsToValidate: (keyof FormData)[] = ['pan', 'aadhaar', 'vpa', 'panImage', 'aadhaarImage'];
        //     fieldsToValidate.forEach(field => {
        //         if (!formData[field]) {
        //             newErrors[field] = true;
        //             isValid = false;
        //         }
        //     });
        // }

        // setErrors(newErrors);
        return isValid;
    };

    const handleNext = (e:any) => {
        if (validateStep()) {
            setStep(parseInt(e.target.value));
            if(step===2){
                setTimer(30);
                const countdown = setInterval(() => {
                    setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
                }, 1000);
            
                return () => clearInterval(countdown);
            }
        }
    };

    const handleFileChange = (name: keyof FormData, file: File | null) => {
        setFormData({
            ...formData,
            [name]: file,
        });
    };

    const handleSubmitOtp = async (e:any) => {
        return null;
        try {
            e.preventDefault();
            const regex = new RegExp("^[6-9]\\d{9}$");
            const phoneNumber = formData.phone;

            if (!regex.test(phoneNumber)) {
                Toast.fire({
                    icon: 'error',
                    title: 'Invalid Mobile Number'
                });
                setFormData({
                    ...formData,
                    phone:"",
                });
                e.target.reset();
                return;
            }

            // Check if user exists or not
            const existingData = await get(`/auth/check-if-exist?phone=${phoneNumber}`);
            if (existingData?.data) {
                if (existingData?.data?.isExist == false) {
                    Toast.fire({
                        icon: 'error',
                        title: "You are not authorized to login"
                    });
                    e.target.reset();
                    return;
                }
            } else {
                throw new Error("Internal Server Error");
            }

            const res = await LoginSendOtp("/auth/signup-login/send-otp", { phone: phoneNumber });
            if (res?.success) {
                Toast.fire({
                    icon: 'success',
                    title: res?.message
                });
                setFormData({
                    ...formData,
                    phone:phoneNumber,
                });
            } else {
                Toast.fire({
                    icon: 'error',
                    title: res?.message
                });
                e.target.reset();
                setFormData({
                    ...formData,
                    phone:"",
                });;
            }
        } catch (err) {
            Toast.fire({
                icon: 'info',
                title: "Something went wrong"
            });
        }

        return;
    };
    const handleBack = () => {
        setStep(1)                
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (validateStep()) {
            console.log('Form Submitted', formData);
            router.push('/');
        }
    };

    return (
        <>
            <div className="flex justify-center items-center">
                <p className="text-base font-bold text-center leading-normal text-white-dark">{step}/3</p>
            </div>       
            <form className=" dark:text-white" onSubmit={handleSubmit}>            
                {step === 1 && (
                    <>
                        {/* Step 1: Basics */}
                        <div className=" justify-center items-center">
                            <h1 className='text-3xl text-black  font-inter text-center'>We are Happy to Onboard You</h1>
                            <p className='text-[#9C9AA5] text-center text-sm mx-auto'>This is just the beginning of a remarkable journey—your first step to joining us as an esteemed astrologer!</p>
                            <Image
                                className="mx-auto" 
                                src="/assets/images/monk-logo.png" // Path to your logo image
                                alt="Logo"
                                width={250}
                                height={100}
                                priority
                            />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="Name" className='font-inter '>Your Name <span  className='text-red-500'>*</span></label>
                            <div className="relative text-white-dark">
                                <input
                                    id="Name"
                                    name="name"
                                    type="text"
                                    placeholder="Enter Name"
                                    className={`form-input placeholder:text-white-dark ${errors.name ? 'border-red-500' : 'border-[#FFCD66]'}`}
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.name && <p className="text-red-500 text-sm">Name is required</p>}
                            <p className='text-[#9C9AA5] font-inter text-sm'> Note : Enter you name as per your Government Records { formData.phone}</p>
                        </div>
                        <div className="mt-6">
                            <label htmlFor="phone" className="font-inter">
                                Your Phone Number <span className="text-red-500">*</span>
                            </label>
                            <div className="relative text-white-dark">
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    placeholder="Enter Your Phone Number"
                                    className={`form-input placeholder:text-white-dark ${errors.phone ? 'border-red-500' : 'border-[#FFCD66]'}`}
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.phone && <p className="text-red-500 text-sm">Phone number is required</p>}
                        </div>
                        {/* <div>
                            <label htmlFor="YOE">Years of Experience</label>
                            <input
                                id="YOE"
                                name="yoe"
                                type="number"  // Use type="number" for numeric input
                                className={`form-input placeholder:text-white-dark ${errors.yoe ? 'border-red-500' : ''}`}  // Updated error key to match "yoe"
                                value={formData.yoe}  // Make sure this corresponds to "yoe" not "dob"
                                onChange={handleChange}
                                min="0"  // Optional: minimum value (e.g., 0 for Years of Experience)
                                step="1"  // Optional: ensure only whole numbers
                            />
                            {errors.yoe && <p className="text-red-500 text-sm">Years of Experience is required</p>}
                        </div>
                        <div>
                            <label htmlFor="Gender">Gender</label>
                            <select
                                id="Gender"
                                name="gender"
                                className={`form-input placeholder:text-white-dark ${errors.astrologerType ? 'border-red-500' : ''}`}
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="notToSay">Prefer not to say</option>

                            </select>
                            {errors.astrologerType && <p className="text-red-500 text-sm">Astrologer Type is required</p>}
                        </div> */}
                        {/* <div>
                            <label htmlFor="Image">Profile Image</label>
                            <input
                                id="Image"
                                name="image"
                                type="file"
                                accept="image/*"
                                className={`form-input placeholder:text-white-dark ${errors.image ? 'border-red-500' : ''}`}
                                onChange={handleChange}
                            />
                            {errors.image && <p className="text-red-500 text-sm">Profile Image is required</p>}
                        </div> */}
                        {/* <div>
                            <label htmlFor="AstrologerType">Astrologer Type</label>
                            <select
                                id="AstrologerType"
                                name="astrologerType"
                                className={`form-input placeholder:text-white-dark ${errors.astrologerType ? 'border-red-500' : ''}`}
                                value={formData.astrologerType}
                                onChange={handleChange}
                            >
                                <option value="">Select Astrologer Type</option>
                                {astrologyTypes.map((type) => (
                                    <option key={type} value={type.toLowerCase()}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                            {errors.astrologerType && <p className="text-red-500 text-sm">Astrologer Type is required</p>}
                        </div>
                        <div>
                            <label htmlFor="Language">Language</label>
                            <select
                                id="Language"
                                name="language"
                                className={`form-input placeholder:text-white-dark ${errors.language ? 'border-red-500' : ''}`}
                                value={formData.language}
                                onChange={handleChange}
                            >
                                <option value="">Select Language</option>
                                {languages.map((lang) => (
                                    <option key={lang} value={lang.toLowerCase()}>
                                        {lang}
                                    </option>
                                ))}
                            </select>
                            {errors.language && <p className="text-red-500 text-sm">Language is required</p>}
                        </div>
                        <div>
                            <label htmlFor="Image">Profile Image</label>
                            {/* <ComponentsFormsFileUploadSingle
                                title="Upload Profile Image"
                                onChange={(imageList: any) => {
                                    const image = imageList.length > 0 ? imageList[0].file : null;
                                    handleFileChange('image', image);
                                }}
                            /> */}
                            {errors.image && <p className="text-red-500 text-sm">Profile Image is required</p>}
                        {/* </div> */} 
                        <button type="button" className="btn mx-auto w-[60%] text-white font-inter  bg-[#FFCD66] my-10 " value={2} onClick={handleNext}>
                            Continue
                        </button>
                    </>
                )}

                {step === 2 && (
                   <>
                   {/* Step 2: Details */}
                   <div className="justify-center items-center">
                     <h1 className="text-xl text-black font-bold font-inter text-center">
                       Secure Your Account: Verify Your Phone Number!
                     </h1>
                     <Image
                       className="mx-auto my-[5%]"
                       src="/assets/images/Rating.png" // Path to your logo image
                       alt="Logo"
                       width={200}
                       height={100}
                       priority
                     />
                     <h1 className="text-2xl my-[5%] text-black font-bold font-inter text-center">
                       OTP Verification
                     </h1>
                     <div className="font-inter mx-auto w-[65%] text-center">
                       <p>
                         We Will send you a one time password on this
                         <span className="font-bold"> Mobile Number</span>
                       </p>
                       <p className="font-bold my-[5%]">+91 - {formData.phone}</p>
                     </div>
                 
                     {/* OTP Input Fields */}
                     <div className="flex justify-center gap-4 my-5">
                        {[...Array(4)].map((_, index) => (
                            <input
                            key={index}
                            type="text"
                            maxLength={1}
                            className="w-12 h-12 text-center text-xl font-bold bg-gray-100 border border-[#FFCD66] rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-300"
                            value={otp[index] || ""}
                            onChange={(e:any) => {
                                const value = e.target.value.replace(/[^0-9]/g, "");
                                if (value) {
                                const newOtp = [...otp];
                                newOtp[index] = value;
                                setOtp(newOtp);
                                if (e.target.nextSibling) {
                                    e.target.nextSibling.focus();
                                }
                                }
                            }}
                            onKeyDown={(e:any) => {
                                if (e.key === "Backspace") {
                                const newOtp = [...otp];
                                newOtp[index] = "";
                                setOtp(newOtp);
                                if (!e.target.value && e.target.previousSibling) {
                                    e.target.previousSibling.focus();
                                }
                                }
                            }}
                            />
                        ))}
                        </div>
                    </div>
                    <div className="text-center  font-inter my-3">
                    {timer > 0 ? <div className='text-black'>Resend OTP in {timer}s</div> :(<div>You can now resend the OTP. <button onClick={handleSubmitOtp} className='text-[#E9890A]'> Send Otp</button></div>)}
                    </div>
                     <button
                       type="button"
                       value={3}
                       className="btn mx-auto w-[60%] text-white font-inter bg-[#FFCD66] my-5"
                       onClick={handleNext}
                     >
                       Continue
                     </button>
                 </>                 
                )}
                {step === 3 && (
                   <>
                   {/* Step 1: Basics */}
                   <div className=" justify-center items-center">
                       <h1 className='text-3xl text-black  font-inter text-center'>We are Happy to Onboard You</h1>
                       <p className='text-[#9C9AA5] text-center text-sm mx-auto'>This is just the beginning of a remarkable journey—your first step to joining us as an esteemed astrologer!</p>
                   </div>
                   <div className="mb-6">
                       <label htmlFor="Name" className='font-inter '>Your Name <span  className='text-red-500'>*</span></label>
                       <div className="relative text-white-dark">
                           <input
                               id="Name"
                               name="name"
                               type="text"
                               placeholder="Enter Name"
                               className={`form-input placeholder:text-white-dark border-[#FFCD66] bg-gray-100`}
                               value={formData.name}
                               readOnly  // Makes the field uneditable
                            />
                       </div>
                   </div>
                   <div className="mt-6">
                       <label htmlFor="phone" className="font-inter">
                           Your Phone Number <span className="text-red-500">*</span>
                       </label>
                       <div className="relative text-white-dark">
                           <input
                               id="phone"
                               name="phone"
                               type="tel"
                               placeholder="Enter Your Phone Number"
                               className={`form-input placeholder:text-white-dark border-[#FFCD66] bg-gray-100`}
                               value={formData.phone}
                               readOnly  // Makes the field uneditable
                               />
                       </div>
                   </div>
                    <div className="mt-6">
                       <label htmlFor="YOE" className="font-inter">Years of Experience <span className="text-red-500">*</span></label>
                       <input
                           id="YOE"
                           name="yoe"
                           type="number"  // Use type="number" for numeric input
                           placeholder="Enter Your Years of Experience"
                           className={`form-input placeholder:text-white-dark ${errors.yoe ? 'border-red-500' : 'border-[#FFCD66]'}`}  // Updated error key to match "yoe"
                           value={formData.yoe}  // Make sure this corresponds to "yoe" not "dob"
                           onChange={handleChange}
                           min="0"  // Optional: minimum value (e.g., 0 for Years of Experience)
                           step="1"  // Optional: ensure only whole numbers
                       />
                       {errors.yoe && <p className="text-red-500 text-sm">Years of Experience is required</p>}
                   </div>
                   {/*
                   <div>
                       <label htmlFor="Gender">Gender</label>
                       <select
                           id="Gender"
                           name="gender"
                           className={`form-input placeholder:text-white-dark ${errors.astrologerType ? 'border-red-500' : ''}`}
                           value={formData.gender}
                           onChange={handleChange}
                       >
                           <option value="">Select Gender</option>
                           <option value="male">Male</option>
                           <option value="female">Female</option>
                           <option value="notToSay">Prefer not to say</option>

                       </select>
                       {errors.astrologerType && <p className="text-red-500 text-sm">Astrologer Type is required</p>}
                   </div> */}
                   {/* <div>
                       <label htmlFor="Image">Profile Image</label>
                       <input
                           id="Image"
                           name="image"
                           type="file"
                           accept="image/*"
                           className={`form-input placeholder:text-white-dark ${errors.image ? 'border-red-500' : ''}`}
                           onChange={handleChange}
                       />
                       {errors.image && <p className="text-red-500 text-sm">Profile Image is required</p>}
                   </div> */}
                   
                   <div className="mt-6">
                       <label htmlFor="Language" className="font-inter">Language <span className="text-red-500">*</span></label>
                       <select
                           id="Language"
                           name="language"
                           className={`form-input placeholder:text-white-dark ${errors.language ? 'border-red-500' : 'border-[#FFCD66]'}`}
                           value={formData.language}
                           onChange={handleChange}
                       >
                           <option value="">Select Language</option>
                           {languages.map((lang) => (
                               <option key={lang} value={lang.toLowerCase()}>
                                   {lang}
                               </option>
                           ))}
                       </select>
                       {errors.language && <p className="text-red-500 text-sm">Language is required</p>}
                   </div>
                   <div className="mt-6">
                       <label htmlFor="AstrologerType" className="font-inter">Specialization In <span className="text-red-500">*</span></label>
                       <select
                           id="AstrologerType"
                           name="astrologerType"
                           className={`form-input placeholder:text-white-dark ${errors.astrologerType ? 'border-red-500' : 'border-[#FFCD66]'}`}
                           value={formData.astrologerType}
                           onChange={handleChange}
                       >
                           <option value="" >Select Astrologer Type</option>
                           {astrologyTypes.map((type) => (
                               <option key={type} value={type.toLowerCase()}>
                                   {type}
                               </option>
                           ))}
                       </select>
                       {errors.astrologerType && <p className="text-red-500 text-sm">Astrologer Type is required</p>}
                   </div>
                   {/* 
                   <div>
                       <label htmlFor="Image">Profile Image</label>
                       {/* <ComponentsFormsFileUploadSingle
                           title="Upload Profile Image"
                           onChange={(imageList: any) => {
                               const image = imageList.length > 0 ? imageList[0].file : null;
                               handleFileChange('image', image);
                           }}
                       /> */}
                       {errors.image && <p className="text-red-500 text-sm">Profile Image is required</p>}
                   {/* </div> */} 
                   <Link href="/auth/register"> {/* Replace with the target route */}

                   <button type="button" className="btn mx-auto w-[60%] text-white font-inter  bg-[#FFCD66] my-10 " value={2} onClick={handleNext}>
                       Continue
                   </button>
                   </Link>
               </>                
                )}
            </form>
        </>
        
    );
};

export default ComponentsAuthRegisterForm;
