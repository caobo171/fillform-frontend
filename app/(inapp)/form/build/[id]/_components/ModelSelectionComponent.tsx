import React from 'react';
import Select from 'react-select';
import Link from 'next/link';
import { RawDataModel } from '@/store/types';
import { AdvanceModelType } from '@/store/data.service.types';
import { ModelAdvanceBuilder, ModelAdvanceBuilderRef } from '@/app/(inapp)/data/builder/_components/ModelAdvanceBuilder';

interface ModelSelectionComponentProps {
    modelsData: {
        isLoading: boolean;
        error?: { message?: string };
        data?: { data_models: RawDataModel[] };
    };
    isCreatingNewModel: boolean;
    setIsCreatingNewModel: (value: boolean) => void;
    selectedAdvanceModel: RawDataModel | null;
    setSelectedAdvanceModel: (model: RawDataModel | null) => void;
    advanceModelData: AdvanceModelType | null;
    setAdvanceModelData: (data: AdvanceModelType | null) => void;
    modelBuilderRef: React.RefObject<ModelAdvanceBuilderRef>;
    realMappingQuestionToVariable: { [key: string]: string };
    setMappingQuestionToVariable: (mapping: { [key: string]: string }) => void;
    availableQuestions: any[];
}

export const ModelSelectionComponent: React.FC<ModelSelectionComponentProps> = ({
    modelsData,
    isCreatingNewModel,
    setIsCreatingNewModel,
    selectedAdvanceModel,
    setSelectedAdvanceModel,
    advanceModelData,
    setAdvanceModelData,
    modelBuilderRef,
    realMappingQuestionToVariable,
    setMappingQuestionToVariable,
    availableQuestions,
}) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Chọn Model từ danh sách có sẵn</h3>
            {modelsData.isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2 text-gray-600">Đang tải danh sách model...</span>
                </div>
            ) : modelsData.error ? (
                <div className="text-red-600 p-4 bg-red-50 rounded-lg">
                    <p>Lỗi khi tải danh sách model: {modelsData.error?.message || 'Có lỗi xảy ra'}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Model Selection Options */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Chọn phương thức tạo Model
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsCreatingNewModel(false);
                                    setSelectedAdvanceModel(null);
                                    setAdvanceModelData(null);
                                    // Refresh the model builder to clear any existing data
                                    modelBuilderRef.current?.refresh();
                                }}
                                className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${!isCreatingNewModel
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="text-2xl">📋</div>
                                    <div>
                                        <h3 className="font-medium">Sử dụng Model có sẵn</h3>
                                        <p className="text-sm opacity-75">Chọn từ danh sách model đã tạo</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setIsCreatingNewModel(true);
                                    setSelectedAdvanceModel(null);
                                    setAdvanceModelData({
                                        name: 'Model mới',
                                        nodes: [],
                                        edges: []
                                    });
                                }}
                                className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${isCreatingNewModel
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="text-2xl">🆕</div>
                                    <div>
                                        <h3 className="font-medium">Tạo Model mới</h3>
                                        <p className="text-sm opacity-75">Xây dựng model từ đầu</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Model Selection Dropdown - Only show when using existing models */}
                    {!isCreatingNewModel && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Chọn Model có sẵn
                            </label>
                            <Select
                                value={selectedAdvanceModel ? {
                                    value: selectedAdvanceModel.id,
                                    label: `${selectedAdvanceModel.name} - ${(selectedAdvanceModel.data_model?.nodes || []).length} biến - ${new Date(selectedAdvanceModel.createdAt).toLocaleDateString('vi-VN')}`
                                } : null}
                                onChange={(selectedOption: { value: string; label: string } | null) => {
                                    if (selectedOption) {
                                        const model = modelsData.data?.data_models.find(m => m.id === selectedOption.value);
                                        if (model) {
                                            setSelectedAdvanceModel(model);
                                            setAdvanceModelData(model.data_model);
                                        }
                                    } else {
                                        setSelectedAdvanceModel(null);
                                        setAdvanceModelData(null);
                                    }
                                }}
                                options={modelsData.data?.data_models?.map((dataModel: RawDataModel) => ({
                                    value: dataModel.id,
                                    label: `${dataModel.name} - ${(dataModel.data_model?.nodes || []).length} biến - ${new Date(dataModel.createdAt).toLocaleDateString('vi-VN')}`
                                })) || []}
                                placeholder="-- Tìm kiếm và chọn model --"
                                isClearable
                                isSearchable
                                className="text-sm"
                                styles={{
                                    control: (provided: any) => ({
                                        ...provided,
                                        minHeight: '48px',
                                        fontSize: '14px',
                                        borderColor: '#d1d5db',
                                        '&:hover': {
                                            borderColor: '#9ca3af'
                                        },
                                        '&:focus-within': {
                                            borderColor: 'var(--primary)',
                                            boxShadow: '0 0 0 2px rgba(var(--primary-rgb), 0.2)'
                                        }
                                    }),
                                    option: (provided: any, state: any) => ({
                                        ...provided,
                                        fontSize: '14px',
                                        backgroundColor: state.isSelected ? 'var(--primary)' : state.isFocused ? '#f3f4f6' : 'white',
                                        color: state.isSelected ? 'white' : state.isFocused ? '#333' : 'black'
                                    }),
                                    singleValue: (provided: any) => ({
                                        ...provided,
                                        fontSize: '14px'
                                    })
                                }}
                            />
                        </div>
                    )}

                    {/* Model Editor */}
                    {advanceModelData && (
                        <div className="mt-6">
                            <div className="mb-4 p-4 bg-primary-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-primary-800 text-sm font-medium flex items-center gap-2">
                                        {isCreatingNewModel ? (
                                            <>🆕 Đang tạo model mới: <strong>{advanceModelData.name}</strong></>
                                        ) : (
                                            <>
                                                Đang chỉnh sửa model: <strong>{selectedAdvanceModel?.name}</strong>
                                                {selectedAdvanceModel?.id && (
                                                    <Link 
                                                        href={`/data/builder/${selectedAdvanceModel.id}`}
                                                        target="_blank"
                                                        className="inline-flex items-center text-primary-600 hover:text-primary-800 transition-colors"
                                                        title="Mở model trong tab mới"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                    </Link>
                                                )}
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <ModelAdvanceBuilder
                                ref={modelBuilderRef}
                                mappingQuestionToVariable={realMappingQuestionToVariable}
                                setMappingQuestionToVariable={setMappingQuestionToVariable}
                                questions={availableQuestions}
                                model={advanceModelData}
                                setModel={setAdvanceModelData}
                                useLocalStorage={false}
                            />
                        </div>
                    )}

                    {!modelsData.data?.data_models?.length && (
                        <div className="text-center py-8 text-gray-500">
                            <p>Không có model nào được tìm thấy.</p>
                            <p className="text-sm mt-2">Hãy tạo model mới bằng cách chọn "Basic - Tự xây dựng Model".</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
