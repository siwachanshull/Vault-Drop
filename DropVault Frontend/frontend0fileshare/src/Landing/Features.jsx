const Features = () => {
    return (
        <section className="py-10 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl md:text-4xl">
                        Powerful File Management
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 max-w-2xl mx-auto sm:text-base">
                        Experience our intuitive dashboard designed for seamless file sharing and management
                    </p>
                </div>

                {/* Dashboard Preview */}
                <div className="relative max-w-6xl mx-auto">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-xl overflow-hidden border border-gray-200">
                        {/* Dashboard Header */}
                        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-purple-500 rounded-lg"></div>
                                <h3 className="text-sm font-semibold text-gray-900">CloudShare Dashboard</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                            </div>
                        </div>

                        {/* Dashboard Content */}
                        <div className="p-4">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                                <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                                    <div className="text-xs text-gray-500 mb-1">Total Files</div>
                                    <div className="text-xl font-bold text-gray-900">1,234</div>
                                </div>
                                <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                                    <div className="text-xs text-gray-500 mb-1">Storage Used</div>
                                    <div className="text-xl font-bold text-gray-900">45.2 GB</div>
                                </div>
                                <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                                    <div className="text-xs text-gray-500 mb-1">Shared Files</div>
                                    <div className="text-xl font-bold text-gray-900">89</div>
                                </div>
                            </div>

                            {/* File List */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="px-4 py-3 border-b border-gray-200">
                                    <h4 className="text-sm font-semibold text-gray-900">Recent Files</h4>
                                </div>
                                <div className="divide-y divide-gray-200">
                                    {[1, 2, 3, 4, 5].map((item) => (
                                        <div key={item} className="px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div className="text-xs font-medium text-gray-900">Document {item}.pdf</div>
                                                    <div className="text-xs text-gray-500">2.{item} MB • Modified 2 hours ago</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button className="text-gray-400 hover:text-gray-600">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                </button>
                                                <button className="text-gray-400 hover:text-gray-600">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Upload Area */}
                            <div className="mt-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border-2 border-dashed border-purple-300 p-5 text-center">
                                <svg className="w-8 h-8 text-purple-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <p className="text-xs font-medium text-gray-700">Drag and drop files here or click to upload</p>
                                <p className="text-xs text-gray-500 mt-1">Supports all file types up to 1GB</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feature Highlights */}
                <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-2">Secure Storage</h3>
                        <p className="text-sm text-gray-600">Enterprise-grade encryption for all your files</p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-2">Easy Sharing</h3>
                        <p className="text-sm text-gray-600">Share files with anyone, anywhere, instantly</p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-2">Analytics</h3>
                        <p className="text-sm text-gray-600">Track your storage and file activity</p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Features