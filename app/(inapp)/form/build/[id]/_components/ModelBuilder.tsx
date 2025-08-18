import { useMe } from '@/hooks/user';
import { Helper } from '@/services/Helper';
import { DataModel, RawForm } from '@/store/types';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import Select, { MultiValue } from 'react-select';

interface ModelBuilderProps {
    dataForm?: {
        form: RawForm;
        config: any;
    },
    model?: DataModel | null;
    setModel?: (model: DataModel) => void;
}

type FormQuestion = {
    id: string;
    question: string;
    answers?: string[];
};

type Variable = {
    name: string;
    code: string;
    metatype: 'observed_variable' | 'dependent_variable';
    coefficient: number;
    mean: number;
    standard_deviation: number;
    questions?: { id: string, question: string, answers?: string[] }[];
};

export const ModelBuilder = ({ dataForm, model, setModel }: ModelBuilderProps) => {
    const availableQuestions = dataForm?.form?.loaddata || [];

    // Get dependent and independent variables from model
    const dependentVariable = model?.observedItems?.find(item => item.metatype === 'dependent_variable') || null;
    const variables = model?.observedItems?.filter(item => item.metatype === 'observed_variable') || [];


    const handleAddVariable = () => {
        if (!model || !setModel) return;

        const newVar: Variable = {
            name: `Biến độc lập ${variables.length + 1}`,
            code: `var${variables.length + 1}`,
            metatype: "observed_variable",
            coefficient: 0,
            mean: 0,
            standard_deviation: 0,
            questions: []
        };

        const updatedModel = {
            ...model,
            observedItems: [...model.observedItems, newVar]
        };
        setModel(updatedModel);
    };

    const handleRemoveVariable = (index: number) => {
        if (!model || !setModel) return;

        const updatedModel = {
            ...model,
            observedItems: model.observedItems.filter((_, i) => {
                // Keep dependent variable and remove only the specific independent variable
                if (model.observedItems[i].metatype === 'dependent_variable') return true;
                const independentIndex = model.observedItems.slice(0, i).filter(item => item.metatype === 'observed_variable').length;
                return independentIndex !== index;
            })
        };
        setModel(updatedModel);
    };

    const handleUpdateVariable = (variableType: 'dependent' | 'independent', index: number, field: keyof Variable, value: string | number) => {
        if (!model || !setModel) return;

        let updateVars: any = {};
        updateVars[field] = value;
        if (field === 'name') {
            updateVars.code = Helper.purify(value.toString().toLowerCase().split(' ').map(e => e.charAt(0).toUpperCase()).join(''));
        }

        const updatedModel = {
            ...model,
            observedItems: model.observedItems.map((v, i) => {
                if (variableType === 'dependent' && v.metatype === 'dependent_variable') {
                    return { ...v, ...updateVars };
                }
                if (variableType === 'independent' && v.metatype === 'observed_variable') {
                    const independentIndex = model.observedItems.slice(0, i).filter(item => item.metatype === 'observed_variable').length;
                    if (independentIndex === index) {
                        return { ...v, ...updateVars };
                    }
                }
                return v;
            })
        };
        setModel(updatedModel);
    };

    const handleAddQuestionsToVariable = (variableType: 'dependent' | 'independent', index: number, selectedQuestions: MultiValue<{ value: string; label: string; }>) => {
        if (!model || !setModel) return;

        const questions = Array.from(selectedQuestions).map(option =>
            availableQuestions.find(q => q.id === option.value)
        ).filter(Boolean) as FormQuestion[];

        const updatedModel = {
            ...model,
            observedItems: model.observedItems.map((v, i) => {
                if (variableType === 'dependent' && v.metatype === 'dependent_variable') {
                    return { ...v, questions };
                }
                if (variableType === 'independent' && v.metatype === 'observed_variable') {
                    const independentIndex = model.observedItems.slice(0, i).filter(item => item.metatype === 'observed_variable').length;
                    if (independentIndex === index) {
                        return { ...v, questions };
                    }
                }
                return v;
            })
        };
        setModel(updatedModel);
    };


    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Xây dựng Model</h3>


            {/* Main Content Grid: Variables on Left, Visualization on Right */}
            <div className="grid lg:grid-cols-2 gap-8 mb-6">
                {/* Left Column: Variables Section */}
                <div>
                    <div className="mb-3">
                        <h4 className="font-medium">Model Variables</h4>
                    </div>

                    {/* Compact Variable Grid */}
                    <div className="grid gap-4">
                        {/* Biến phụ thuộc*/}
                        <div className="bg-green-50 p-2 border-2 border-green-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-green-700 text-xs">Biến phụ thuộc(Target)</h5>
                            </div>
                            {dependentVariable && (
                                <div className="flex align-items gap-8">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Tên biến</label>
                                        <input
                                            type="text"
                                            value={dependentVariable.name}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateVariable('dependent', 0, 'name', e.target.value)}
                                            className="min-w-[200px] w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Câu hỏi đã chọn ({(dependentVariable.questions || []).length})</label>
                                        <Select
                                            className='flex-wrap max-w-[320px]'
                                            isMulti
                                            value={(dependentVariable.questions || []).map(q => {
                                                let question = availableQuestions.find(e => e.id === q.id);
                                                return {
                                                    value: q.id,
                                                    label: question?.question + (question?.description ? ' (' + question?.description + ')' : '')
                                                };
                                            })}
                                            onChange={(selectedOptions) => handleAddQuestionsToVariable('dependent', 0, selectedOptions || [])}
                                            options={availableQuestions.map(q => ({
                                                value: q.id,
                                                label: q.question + (q.description ? ' (' + q.description + ')' : '')
                                            }))}
                                            placeholder="Hãy chọn các câu hỏi thuộc biến này"
                                            styles={{
                                                control: (provided) => ({
                                                    ...provided,
                                                    minHeight: '32px',
                                                    fontSize: '14px',
                                                    borderColor: '#d1d5db'
                                                }),
                                                valueContainer: (provided) => ({
                                                    ...provided,
                                                    padding: '2px 6px'
                                                }),
                                                multiValue: (provided) => ({
                                                    ...provided,
                                                    fontSize: '12px'
                                                })
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Independent Variables */}
                        {variables.map((variable, index) => (
                            <div key={index} className="bg-blue-50 p-2 border-2 border-blue-200 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-medium text-blue-700 text-xs">Biến độc lập {index + 1}</h5>
                                    <button
                                        onClick={() => handleRemoveVariable(index)}
                                        className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded"
                                    >
                                        Xoá biến
                                    </button>
                                </div>
                                <div className="flex align-items gap-8">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Tên biến</label>
                                        <input
                                            type="text"
                                            value={variable.name}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateVariable('independent', index, 'name', e.target.value)}
                                            className="min-w-[200px] w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Câu hỏi đã chọn ({(variable.questions || []).length})</label>
                                        <Select
                                            isMulti
                                            className='flex-wrap max-w-[320px]'
                                            value={(variable.questions || []).map(q => {
                                                let question = availableQuestions.find(e => e.id === q.id);
                                                return {
                                                    value: q.id,
                                                    label: question?.question + (question?.description ? ' (' + question?.description + ')' : '')
                                                };
                                            })}
                                            onChange={(selectedOptions) => handleAddQuestionsToVariable('independent', index, selectedOptions || [])}
                                            options={availableQuestions.map(q => ({
                                                value: q.id,
                                                label: q.question + (q.description ? ' (' + q.description + ')' : '')
                                            }))}
                                            placeholder="Hãy chọn các câu hỏi thuộc biến này"
                                            styles={{
                                                control: (provided) => ({
                                                    ...provided,
                                                    minHeight: '32px',
                                                    fontSize: '14px',
                                                    borderColor: '#d1d5db'
                                                }),
                                                valueContainer: (provided) => ({
                                                    ...provided,
                                                    padding: '2px 6px'
                                                }),
                                                multiValue: (provided) => ({
                                                    ...provided,
                                                    fontSize: '12px'
                                                })
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add Variable Button */}
                        <div className="mt-3">
                            <button
                                onClick={handleAddVariable}
                                className="w-full flex items-center justify-center px-3 py-2 text-xs font-medium text-primary border-2 border-dashed border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                            >
                                + Thêm biến độc lập
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Model Visualization */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-medium mb-4">Hiển thị mô hình</h4>
                    {dependentVariable && variables.length > 0 ? (
                        <div className="flex items-center justify-center h-full min-h-[400px] relative">
                            {/* Independent Variables (Left side) */}
                            <div className="flex flex-col space-y-6 mr-20">
                                {variables.map((variable, index) => (
                                    <div key={variable.code} className="flex items-center">
                                        {/* Variable Box */}
                                        <div className="bg-white border-2 border-gray-800 px-4 py-2 text-xs font-medium min-w-[180px] text-center">
                                            {variable.name || `Variable ${index + 1}`}
                                        </div>
                                        {/* Hypothesis Label */}
                                        <div className="ml-4 text-xs font-medium text-gray-700">
                                            H{index + 1} +
                                        </div>
                                        {/* Diagonal Arrow pointing to dependent variable */}
                                        <div className="ml-2">
                                            <svg width="140" height="60" viewBox="0 0 140 60" className="text-gray-600">
                                                {/* Calculate diagonal line based on position */}
                                                <path 
                                                    d={`M5 30 L120 ${30 + (index - (variables.length - 1) / 2) * -15} M115 ${25 + (index - (variables.length - 1) / 2) * -15} L120 ${30 + (index - (variables.length - 1) / 2) * -15} L115 ${35 + (index - (variables.length - 1) / 2) * -15}`} 
                                                    stroke="currentColor" 
                                                    strokeWidth="2" 
                                                    fill="none" 
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Dependent Variable (Right side - Ellipse) */}
                            <div className="bg-white border-2 border-gray-800 rounded-full px-6 py-4 text-center min-w-[160px]">
                                <div className="text-xs font-medium">
                                    {dependentVariable.name || 'Biến phụ thuộc'}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full min-h-[400px] text-gray-500">
                            <div className="text-center">
                                <p className="text-xs">Thêm biến độc lập để nhìn mô hình</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
