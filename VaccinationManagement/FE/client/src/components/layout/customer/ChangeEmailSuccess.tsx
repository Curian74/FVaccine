import { useNavigate } from "react-router-dom";

const ChangeEmailSuccess = () => {
    const searchParams = new URLSearchParams(location.search);
    const newEmail = searchParams.get("newEmail");

    if (newEmail) {
        localStorage.setItem('email', newEmail);
    }

    const navigate = useNavigate();

    setTimeout(() => {
        navigate('/home');
    }, 5000);

    return (
        <>
            <div className="flex flex-col py-20 items-center min-h-screen">
                <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="36" r="35" fill="#6FDAC9" stroke="#171321" stroke-width="2" stroke-linecap="square" /><path d="M24 36.917L31.059 44 48 27" stroke="#171321" stroke-width="2" stroke-linecap="square" /></svg>
                <div className="flex flex-col items-center text-center mt-10">
                    <h1 className="text-3xl font-bold">Verification successful</h1>
                    <div className="w-3/5 text-center mt-3">
                        <p className="mt-6">Your email has been successfully verified. You'll be redirected to your
                            account in just a moment. You can also <a href='/home' className="text-blue-400">refresh the page.</a></p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChangeEmailSuccess;
