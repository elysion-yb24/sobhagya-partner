'use client';
import IconUser from '@/components/icon/icon-user';
import { useState,useEffect,useRef } from 'react';
import { useRouter } from 'next/navigation';
import ComponentsFormsFileUploadSingle from '../forms/file-upload/components-forms-file-upload-single'; // Import your component
import Image from "next/image";
import { get, LoginSendOtp } from "@/utils";
import Swal from 'sweetalert2';
import Link from 'next/link';
import * as bodyPix from "@tensorflow-models/body-pix";
import "@tensorflow/tfjs"; 

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


const KYCRegisterForm=  () => {
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



    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const [loading, setLoading] = useState<boolean>(false);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
  
    useEffect(() => {
      const loadModel = async () => {
        await bodyPix.load();
      };
      loadModel();
    }, []);
  
    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files ? event.target.files[0] : null;
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        setUploadedImage(imageUrl);
  
        const img = new window.Image();
        img.src = imageUrl;
        img.onload = async () => {
          const width = img.width;
          const height = img.height;
          setImageDimensions({ width, height });
  
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext("2d");
  
          if (canvas && ctx) {
            canvas.width = width;
            canvas.height = height;
  
            // Load BodyPix model
            const net = await bodyPix.load();
            setLoading(true);
  
            // Segment the human from the image
            const segmentation = await net.segmentPersonParts(img);
  
            // Get the image data
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;
  
            // Loop through all pixels and change the background to white
            for (let i = 0; i < data.length; i += 4) {
              const part = segmentation.data[i / 4]; // Get the segment part of the pixel
  
              // If the pixel is not part of the human (i.e., background), make it white
              if (part === 0) {
                data[i] = 255;     // Red
                data[i + 1] = 255; // Green
                data[i + 2] = 255; // Blue
              }
            }
  
            // Put the modified image data back to the canvas
            ctx.putImageData(imageData, 0, 0);
            setLoading(false);
          }
        };
      }
    };
  
    
      
const handleEdit = () => {
    // Add editing functionality if needed
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
                <p className="text-base font-bold text-center leading-normal text-white-dark">{step}/4</p>
            </div>       
            <form className=" dark:text-white" onSubmit={handleSubmit}>            
            {step === 1 && (
                <>
                    {/* Step 1: Basics */}
                    <div className="justify-center items-center">
                        <h1 className="text-3xl text-black font-inter text-center">Upload Your Adhaar Card</h1>
                        <div className="flex flex-col items-center">
                            {uploadedImage ? (
                                <canvas
                                ref={canvasRef}
                                className="mx-auto my-[5%] bg-white p-2 rounded"
                                style={{
                                    maxWidth: "100%",
                                    height: "auto",
                                    display: "block",
                                }}
                                />
                            ) : (
                                <img
                                className="mx-auto my-[5%]"
                                src="/assets/images/Group-2.png" // Placeholder image
                                alt="Placeholder"
                                width={150}
                                height={100}
                                />
                            )}

                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            <button
                                type="button"
                                className="flex items-center justify-center w-[45%] py-2 bg-white border border-[#FFCD66] text-black font-inter rounded-lg gap-3"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <img
                                src="/assets/images/Upload.png"
                                alt="Upload Icon"
                                width={30}
                                height={30}
                                className="h-auto w-auto"
                                />
                                Upload Adhaar
                            </button>
                            </div>

                        <div className="flex justify-center items-center my-[5%] gap-4 mt-6">
                            <div className="border border-[#FFCD66] h-[50px] mx-4"></div>
                            <button
                                type="button"
                                className="flex items-center justify-center w-[45%] py-2 bg-white border border-[#FFCD66] text-black font-inter rounded-lg gap-3"
                                onClick={handleEdit}
                            >
                                <Image
                                    src="/assets/images/Edit.png"
                                    alt="Edit Icon"
                                    width={30}
                                    height={30}
                                    className="h-auto w-auto"
                                    priority
                                />
                                Edit Adhaar
                            </button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="Name" className="font-inter">
                            Enter Adhaar Number <span className="text-red-500">*</span>
                        </label>
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
                        <p className="text-[#9C9AA5] font-inter text-sm">
                            Note : Enter your name as per your Government Records {formData.phone}
                        </p>
                    </div>

                    <button type="button" className="btn mx-auto w-[60%] text-white font-inter bg-[#FFCD66] my-10" value={2} onClick={handleNext}>
                        Continue
                    </button>
                </>
            )}


                {step === 2 && (
                   <>
                   {/* Step 2: Details */}
                   <div className="justify-center items-center">
                     <h1 className="text-xl text-black font-bold font-inter text-center">
                        Upload Your Pan Card
                         </h1>
                     <Image
                       className="mx-auto my-[5%]"
                       src="/assets/images/Group-2.png" // Path to your logo image
                       alt="Logo"
                       width={150}
                       height={100}
                       priority
                     />   
                      <div className="flex justify-center items-center my-[5%] gap-4 mt-6"> {/* Flex container for buttons */}
                                <button 
                                    type="button" 
                                    className="flex items-center justify-center w-[45%] py-2 bg-white border border-[#FFCD66] text-black font-inter  rounded-lg gap-3"
                                ><Image
                                    src="/assets/images/Upload.png" // Path to your logo image
                                    alt="Logo"
                                    width={30}
                                    height={30}
                                    className="h-auto w-auto"
                                priority
                                />
                                    Upload Pan Card 
                                </button>
                                <div className="border border-[#FFCD66] h-[50px] mx-4"></div> {/* Vertical line */}
                                <button 
                                    type="button" 
                                    className="flex items-center justify-center w-[45%] py-2 bg-white border border-[#FFCD66] text-black font-inter  rounded-lg gap-3"
                                >
                                    <Image
                                        src="/assets/images/Edit.png" // Path to your logo image
                                        alt="Logo"
                                        width={30}
                                        height={30}
                                        className="h-auto w-auto" // Ensures responsive sizing
                                        priority
                                    />
                                    Edit Pan Card 
                                </button>
                            </div>              
                   </div>          
                   <div className="mb-6">
                            <label htmlFor="Name" className='font-inter '>Enter Pan Number <span  className='text-red-500'>*</span></label>
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
                   {/* Step 2: Details */}
                   <div className="justify-center items-center">
                     <h1 className="text-xl text-black font-bold font-inter text-center">
                        Upload Your Profile
                         </h1>
                     <Image
                       className="mx-auto my-[5%]"
                       src="/assets/images/Group-profile.png" // Path to your logo image
                       alt="Logo"
                       width={150}
                       height={100}
                       priority
                     />    
                      <div className="flex justify-center items-center my-[5%] gap-4 mt-6"> {/* Flex container for buttons */}
                                <button 
                                    type="button" 
                                    className="flex items-center justify-center w-[45%] py-2 bg-white border border-[#FFCD66] text-black font-inter  rounded-lg gap-3"
                                ><Image
                                    src="/assets/images/Upload.png" // Path to your logo image
                                    alt="Logo"
                                    width={30}
                                    height={30}
                                    className="h-auto w-auto"
                                priority
                                />
                                    Upload Profile 
                                </button>
                                <div className="border border-[#FFCD66] h-[50px] mx-4"></div> {/* Vertical line */}
                                <button 
                                    type="button" 
                                    className="flex items-center justify-center w-[45%] py-2 bg-white border border-[#FFCD66] text-black font-inter  rounded-lg gap-3"
                                >
                                    <Image
                                        src="/assets/images/Edit.png" // Path to your logo image
                                        alt="Logo"
                                        width={30}
                                        height={30}
                                        className="h-auto w-auto" // Ensures responsive sizing
                                        priority
                                    />
                                    Edit Profile
                                </button>
                            </div>             
                   </div>          
                   <div className="mb-6">
                            <label htmlFor="Name" className='font-inter '>Display Name <span  className='text-red-500'>*</span></label>
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
                     <button
                       type="button"
                       value={4}
                       className="btn mx-auto w-[60%] text-white font-inter bg-[#FFCD66] my-5"
                       onClick={handleNext}
                     >
                       Continue
                     </button>
                 </>                 
                )}
                {step === 4 && (
                   <>
                   {/* Step 1: Basics */}
                   <div className=" justify-center items-center">
                       <h1 className='text-3xl text-black  font-inter text-center'>Enter Your Bank Details</h1>
                   </div>
                   <div className="mb-6">
                       <label htmlFor="Name" className='font-inter '>Bank Account Number <span  className='text-red-500'>*</span></label>
                       <div className="relative text-white-dark">
                           <input
                               id="Name"
                               name="name"
                               type="text"
                               placeholder="Enter Bank Account Name"
                               className={`form-input placeholder:text-white-dark ${errors.yoe ? 'border-red-500' : 'border-[#FFCD66]'}`}  // Updated error key to match "yoe"
                               value={formData.name}
                                 // Makes the field uneditable
                            />
                       </div>
                   </div>
                   <div className="mt-6">
                       <label htmlFor="phone" className="font-inter">
                           Account Holder Name <span className="text-red-500">*</span>
                       </label>
                       <div className="relative text-white-dark">
                           <input
                               id="phone"
                               name="phone"
                               type="tel"
                               placeholder="Enter Your Account Holder Name"
                               className={`form-input placeholder:text-white-dark ${errors.yoe ? 'border-red-500' : 'border-[#FFCD66]'}`}  // Updated error key to match "yoe"
                               value={formData.phone}
                                 // Makes the field uneditable
                               />
                       </div>
                   </div>
                    <div className="mt-6">
                       <label htmlFor="YOE" className="font-inter">IFSC Code <span className="text-red-500">*</span></label>
                       <input
                           id="YOE"
                           name="yoe"
                           type="string"  // Use type="number" for numeric input
                           placeholder="Enter Your IFSC Code"
                           className={`form-input placeholder:text-white-dark ${errors.yoe ? 'border-red-500' : 'border-[#FFCD66]'}`}  // Updated error key to match "yoe"
                           value={formData.yoe}  // Make sure this corresponds to "yoe" not "dob"
                           onChange={handleChange}
                           min="0"  // Optional: minimum value (e.g., 0 for Years of Experience)
                           step="1"  // Optional: ensure only whole numbers
                       />
                       {errors.yoe && <p className="text-red-500 text-sm">Years of Experience is required</p>}
                   </div>
                   <div className="mt-6">
                       <label htmlFor="YOE" className="font-inter">Branch Name <span className="text-red-500">*</span></label>
                       <input
                           id="YOE"
                           name="yoe"
                           type="string"  // Use type="number" for numeric input
                           placeholder="Enter Your Branch Name"
                           className={`form-input placeholder:text-white-dark ${errors.yoe ? 'border-red-500' : 'border-[#FFCD66]'}`}  // Updated error key to match "yoe"
                           value={formData.yoe}  // Make sure this corresponds to "yoe" not "dob"
                           onChange={handleChange}
                           min="0"  // Optional: minimum value (e.g., 0 for Years of Experience)
                           step="1"  // Optional: ensure only whole numbers
                       />
                       {errors.yoe && <p className="text-red-500 text-sm">Years of Experience is required</p>}
                   </div>
                   <div className="mt-6">
                       <label htmlFor="YOE" className="font-inter">Your UPI ID <span className="text-red-500">*</span></label>
                       <input
                           id="YOE"
                           name="yoe"
                           type="string"  // Use type="number" for numeric input
                           placeholder="Enter Your UPI ID"
                           className={`form-input placeholder:text-white-dark ${errors.yoe ? 'border-red-500' : 'border-[#FFCD66]'}`}  // Updated error key to match "yoe"
                           value={formData.yoe}  // Make sure this corresponds to "yoe" not "dob"
                           onChange={handleChange}
                           min="0"  // Optional: minimum value (e.g., 0 for Years of Experience)
                           step="1"  // Optional: ensure only whole numbers
                       />
                       <p className='text-[#9C9AA5] font-inter text-sm'>Note :  We can process transactions through both bank accounts and UPI. In case of any banking issues, we will ensure the transfer of your amount via UPI as an alternative.</p>
                       {errors.yoe && <p className="text-red-500 text-sm">Years of Experience is required</p>}
                   </div>
                  
                   
                 
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

export default KYCRegisterForm;
