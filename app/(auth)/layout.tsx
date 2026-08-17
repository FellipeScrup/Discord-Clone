const AuthLayout = ({ children }:{children: React.ReactNode}) => {
    return (
        <div className="h-full flex items-center justify-center bg-[#5865F2]">
            {children}
        </div>
    );
}
 
export default AuthLayout;