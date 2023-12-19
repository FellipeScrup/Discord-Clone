const AuthLayout = ({ children }:{children: React.ReactNode}) => {
    return (
        <div className="bg-red-500">
            {children}
        </div>
    );
}
 
export default AuthLayout;