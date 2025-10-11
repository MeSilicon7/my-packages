import { useForm } from "react-hook-form";
import { useFileUploadProgress } from "../../../use-file-upload-progress/src";


export default function Home() {
  const { register, handleSubmit, reset } = useForm();
  const { uploadFile, progress, isUploading, error, abort } = useFileUploadProgress();


  const onSubmit = async (data: any) => {
    // 1. get pre-signed URL from backend
    const filetype = data.file[0].type;
    const fileName = data.file[0].name;
    const getUrlResponse = await fetch('/get-cf-r2-link-api?fileName=' + encodeURIComponent(fileName) + '&fileType=' + encodeURIComponent(filetype))
    const { url } = await getUrlResponse.json()
    console.log('Pre-signed URL:', url)

    // 2. upload file to R2
    if (data.file && data.file.length > 0) {
      const file = data.file[0]
      
      // Fix: correct parameter order and configure for R2 upload
      const uploadResult = await uploadFile(file, url, {
        onProgress: (progress) => console.log(`Upload progress: ${progress}%`)
      })

      if (uploadResult) {
        console.log('File uploaded successfully:', uploadResult)
        
        // 3. submit form data to backend only after successful upload
        const formData = {
          name: data.name,
          email: data.email,
          message: data.message,
          fileUrl: url.split('?')[0] // remove query params from URL
        }

        const submitResponse = await fetch('/submit-form-api', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })

        if (submitResponse.ok) {
          console.log('Form submitted successfully')
          alert('Form submitted successfully!')
          reset() // reset form after successful submission
        } else {
          console.error('Form submission failed')
          alert('Form submission failed!')
        }
      } else {
        console.error('File upload failed')
        alert('File upload failed!')
      }
    }
  }

  return(
  <>
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">Contact Form</h1>

        {isUploading && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-blue-600 h-4 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">Uploading: {progress}%</p>
            <button 
              onClick={abort}
              className="mt-2 text-sm text-red-600 hover:underline"
            >
              Abort Upload
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <input 
              type="text" 
              placeholder="Your Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              {...register("name")} 
            />
          </div>
          <div>
            <textarea 
              placeholder="Your Message"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-none"
              {...register("message")} 
            />
          </div>
          <div>
            <input 
              type="email" 
              placeholder="Your Email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              {...register("email")} 
            />
          </div>
          <div>
            <input 
              type="file" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              {...register("file")} 
              // multiple={true}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  </>
  )
}