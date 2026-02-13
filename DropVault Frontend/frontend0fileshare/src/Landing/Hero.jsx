const Hero = ({openSignIn, openSignUp}) => {
    return (
        <div className="landing-page relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-indigo-50 opacity-80 z-0 pointer-events-none"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="pt-16 pb-14 sm:pt-20 sm:pb-16 lg:pt-28 lg:pb-20">
                    <div className="text-center">
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl">
                            <span className="block">Share Files Securely with</span>
                            <span className="block text-purple-600">CloudShare</span>
                        </h1>
                        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:text-xl md:max-w-2xl">
                            Upload, manage and share your files securely with CloudShare
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 pointer-events-auto">
                            <button
                            onClick={()=>openSignUp()}
                             className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-500 hover:bg-purple-600 active:bg-purple-700 md:px-8 md:py-3 md:text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer">Get Started</button>
                            <button
                             onClick={()=>openSignIn()}
                            className="flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 md:px-8 md:py-3 md:text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer">Sign In</button>
                        </div>
                        <div className="mt-8 text-center">
                            <p className="text-base text-gray-500">
                                All Your Files are encrypted and stored with enterprise grade security protocols.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Hero;