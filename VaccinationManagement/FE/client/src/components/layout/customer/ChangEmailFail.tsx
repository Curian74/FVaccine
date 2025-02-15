import { useNavigate } from 'react-router-dom';
import errorImage from '../../../assets/images/error-svgrepo-com.svg';
const ChangeEmailFail = () => {
    const navigate = useNavigate();

    setTimeout(() => {
        navigate('/home');
    }, 5000);

    return (
        <>
            <div className="flex flex-col py-20 items-center min-h-screen">
                <img className='w-20' src={errorImage}></img>
                <div className="flex flex-col items-center text-center mt-10">
                    <h1 className="text-3xl font-bold">Verification Failed</h1>
                    <div className="w-3/5 text-center mt-3">
                        <p className="mt-6">Your email has not been verified. You'll be redirected to your
                            account in just a moment. You can also <a href='/home' className="text-blue-400">refresh the page.</a></p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChangeEmailFail;
