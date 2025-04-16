'use client';

import Image from 'next/image';

type ChatError = {
    id: string;
    type: 'error' | 'warning' | 'note';
    message: string;
};

type WarningChatBoxProps = {
    chatOpen: boolean;
    chatErrors: ChatError[];
    toggleChat: () => void;
    removeChatError: (id: string) => void;
};

const WarningChatBox = ({ chatOpen, chatErrors, toggleChat, removeChatError }: WarningChatBoxProps) => {
    return (
        <div className={`fixed bottom-4 right-4 w-80 bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 z-[9999] ${chatOpen ? 'h-96' : 'h-14'} border border-gray-200`}>
            <div
                className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-3 flex items-center justify-between cursor-pointer"
                onClick={toggleChat}
            >
                <div className="flex items-center">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-white bg-opacity-20 mr-2">
                        <Image src="/static/img/logo-white-short.png" alt="Logo" width={20} height={20} className="h-5 w-auto" />
                    </div>
                    <span className="font-medium">Bé Fill Điền Form</span>
                </div>
                <div className="flex items-center">
                    <div className="relative mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white text-opacity-90" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                        {chatErrors.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-white">
                                {chatErrors.length}
                            </span>
                        )}
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transform transition-transform duration-300 ${chatOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>

            {chatOpen && (
                <div className="p-4 h-[calc(100%-3.5rem)] overflow-y-auto">
                    <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-gray-100">
                        <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-xs font-medium text-gray-800">Bé Fill kiểm tra cấu hình</p>
                    </div>

                    <div className="text-xs space-y-3">
                        <p className="bg-primary-50 p-2 rounded-lg rounded-tl-none text-gray-700">
                            💡 Chào bạn! Bé Fill ở đây để giúp bạn check những rủi ro Config nha.
                        </p>

                        {chatErrors.length === 0 && (
                            <div className="flex justify-center my-8">
                                <div className="text-center text-gray-500 text-xs">
                                    <svg className="mx-auto h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p>Chưa có lỗi nào</p>
                                </div>
                            </div>
                        )}

                        {chatErrors.map((error) => (
                            <div key={error.id} className="mt-2 relative">
                                <div className={`p-3 rounded-lg rounded-tl-none text-xs relative
                                    ${error.type === "error" ? "bg-red-50 text-red-800" :
                                        error.type === "warning" ? "bg-yellow-50 text-yellow-800" :
                                            "bg-primary-50 text-blue-800"
                                    }`}>
                                    <button
                                        className="absolute top-1 right-1 text-xs opacity-70 hover:opacity-100 transition-opacity"
                                        onClick={() => removeChatError(error.id)}
                                        aria-label="Close"
                                    >
                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    {error.type === "error" && (
                                        <div className="flex items-center gap-1 mb-1 font-semibold">
                                            <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            <span>Lỗi!</span>
                                        </div>
                                    )}
                                    {error.type === "warning" && (
                                        <div className="flex items-center gap-1 mb-1 font-semibold">
                                            <svg className="h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            <span>Cẩn thận!</span>
                                        </div>
                                    )}
                                    {error.type === "note" && (
                                        <div className="flex items-center gap-1 mb-1 font-semibold">
                                            <svg className="h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>Thông báo</span>
                                        </div>
                                    )}
                                    <span className="text-xs" dangerouslySetInnerHTML={{ __html: error.message }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WarningChatBox;
