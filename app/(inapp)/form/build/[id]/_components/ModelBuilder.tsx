import { useMe } from '@/hooks/user';
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
    onSaveModel?: (model: DataModel) => void;
}

type FormQuestion = {
    id: string;
    question: string;
    answers?: string[];
};

type Variable = {
    id: string;
    name: string;
    code: string;
    metatype: 'observed_variable' | 'dependent_variable';
    coefficient: number;
    mean: number;
    standard_deviation: number;
    questions: { id: string, question: string, answers?: string[] }[];
};

type LocalModel = {
    code: string;
    name: string;
    model: "linear_regression";
    questions: FormQuestion[];
};

export const ModelBuilder = ({ dataForm, model, onSaveModel }: ModelBuilderProps) => {
    // Model name will be auto-generated when saving
    const [dependentVariable, setDependentVariable] = useState<Variable | null>(null);
    const [variables, setVariables] = useState<Variable[]>([]);
    const availableQuestions = dataForm?.form?.loaddata || [];


    // Extract questions from form sections
    useEffect(() => {


        // Initialize dependent variable on mount
        if (!dependentVariable) {
            const newVar = {
                id: generateId(),
                name: 'Dependent Variable',
                code: generateId().substring(0, 8),
                questions: [],
                metatype: 'dependent_variable' as const,
                coefficient: 1.0,
                mean: 0,
                standard_deviation: 1
            };
            setDependentVariable(newVar);
        }
    }, [dataForm, dependentVariable]);

    // Initialize from existing model if available
    useEffect(() => {
        if (model) {
            const dependentItem = model.observedItems.find(item => item.metatype === 'dependent_variable');
            const independentItems = model.observedItems.filter(item => item.metatype === 'observed_variable');

            if (dependentItem) {
                setDependentVariable({
                    id: `dv_${Date.now()}`,
                    ...dependentItem,
                    questions: dependentItem.questions || []
                });
            }

            setVariables(independentItems.map(item => ({
                id: `var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                ...item,
                questions: item.questions || []
            })));
        }
    }, [model]);

    const handleAddVariable = () => {
        const newVar: Variable = {
            id: `var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: `Variable ${variables.length + 1}`,
            code: `var${variables.length + 1}`,
            metatype: "observed_variable",
            coefficient: 0,
            mean: 0,
            standard_deviation: 0,
            questions: []
        };

        setVariables([...variables, newVar]);
    };

    const handleRemoveVariable = (id: string) => {
        setVariables(variables.filter(v => v.id !== id));
    };

    // Generate a unique ID for variables
    const generateId = () => {
        return `id_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    };

    const handleUpdateVariable = (id: string, field: keyof Variable, value: string | number) => {
        if (dependentVariable && dependentVariable.id === id) {
            setDependentVariable({ ...dependentVariable, [field]: value });
        } else {
            setVariables(variables.map(v => v.id === id ? { ...v, [field]: value } : v));
        }
    };

    const handleAddQuestionsToVariable = (variableId: string, selectedQuestions: MultiValue<{ value: string; label: string; }>) => {
        const questions = Array.from(selectedQuestions).map(option =>
            availableQuestions.find(q => q.id === option.value)
        ).filter(Boolean) as FormQuestion[];

        if (dependentVariable && dependentVariable.id === variableId) {
            setDependentVariable({
                ...dependentVariable,
                questions: questions
            });
        } else {
            setVariables(variables.map(v => {
                if (v.id === variableId) {
                    return {
                        ...v,
                        questions: questions
                    };
                }
                return v;
            }));
        }
    };

    const handleSaveModel = () => {
        if (!dependentVariable || variables.length === 0) return;

        // Generate model name and code
        const generatedModelName = `Regression_Model_${Date.now()}`;
        const generatedModelCode = generatedModelName.toLowerCase().replace(/\s+/g, '_').substring(0, 15) + '_' + Date.now().toString().substring(9, 13);

        // Build the model structure
        const model: DataModel = {
            model: {
                code: generatedModelCode,
                name: generatedModelName,
                model: 'linear_regression',
                questions: dependentVariable.questions,
                residual: 0.05 // Default residual
            },
            observedItems: [
                // Dependent variable
                {
                    ...dependentVariable,
                    metatype: 'dependent_variable',
                },
                // Independent variables
                ...variables
            ]
        };

        // Call the provided callback
        onSaveModel?.(model);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Xây dựng Model</h3>

            {/* Form info */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="relative">
                    <label htmlFor="urlMain" className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-600">
                        Link Form
                    </label>
                    <div className="flex">
                        <span className="inline-flex items-center px-3 text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </span>
                        <input type="text" id="urlMain" name="urlMain" defaultValue={dataForm?.form.urlMain}
                            className="rounded-r-md border-gray-300 flex-1 appearance-none border px-3 py-2 bg-white text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent" readOnly />
                    </div>
                </div>
                <div className="relative">
                    <label htmlFor="urlCopy" className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-600">
                        Tên Form
                    </label>
                    <div className="flex">
                        <span className="inline-flex items-center px-3 text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </span>
                        <input type="text" id="urlCopy" name="urlCopy" defaultValue={dataForm?.form.name}
                            className="rounded-r-md border-gray-300 flex-1 appearance-none border px-3 py-2 bg-white text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent" readOnly />
                    </div>
                </div>
            </div>



            {/* Variables Section */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Model Variables</h4>
                    <button
                        onClick={handleAddVariable}
                        className="flex items-center justify-center px-4 py-2 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors"
                    >
                        + Add Variable
                    </button>
                </div>

                {/* Dependent Variable */}
                <div className="bg-white p-4 border border-gray-200 rounded-lg">
                    <h5 className="font-medium mb-2 text-primary">Dependent Variable (Target)</h5>
                    {dependentVariable && (
                        <div>
                            <div className="mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Variable Name</label>
                                    <input
                                        type="text"
                                        value={dependentVariable.name}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateVariable(dependentVariable.id, 'name', e.target.value)}
                                        className="w-full rounded-md border border-gray-300 flex-1 appearance-none px-3 py-2 bg-white text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Questions mapping */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Questions that measure this variable</label>
                                <Select
                                    isMulti
                                    value={dependentVariable.questions.map(q => {
                                        let question = availableQuestions.find(e => e.id === q.id);
                                        return {
                                            value: q.id,
                                            label: question?.question + (question?.description ? ' (' + question?.description + ')' : '')
                                        };
                                    })}
                                    onChange={(selectedOptions) => handleAddQuestionsToVariable(dependentVariable.id, selectedOptions || [])}
                                    options={availableQuestions.map(q => ({
                                        value: q.id,
                                        label: q.question + (q.description ? ' (' + q.description + ')' : '')
                                    }))}
                                    placeholder="Select questions..."
                                    className="mb-2"
                                    styles={{
                                        control: (provided) => ({
                                            ...provided,
                                            borderColor: '#d1d5db',
                                            '&:hover': {
                                                borderColor: '#d1d5db'
                                            },
                                            '&:focus': {
                                                borderColor: '#2563eb',
                                                boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.2)'
                                            }
                                        })
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Independent Variables */}
                <div className="space-y-4">
                    {variables.map((variable) => (
                        <div key={variable.id} className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-center mb-3">
                                <h5 className="font-medium">Independent Variable</h5>
                                <button
                                    onClick={() => handleRemoveVariable(variable.id)}
                                    className="text-red-500 hover:text-red-700 px-2 py-1 rounded"
                                >
                                    🗑️ Remove
                                </button>
                            </div>

                            <div className="mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Variable Name</label>
                                    <input
                                        type="text"
                                        value={variable.name}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateVariable(variable.id, 'name', e.target.value)}
                                        className="w-full rounded-md border border-gray-300 flex-1 appearance-none px-3 py-2 bg-white text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Questions mapping */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Questions that measure this variable</label>
                                <Select
                                    isMulti
                                    value={variable.questions.map(q => {
                                        let question = availableQuestions.find(e => e.id === q.id);
                                        return {
                                            value: q.id,
                                            label: question?.question + (question?.description ? ' (' + question?.description + ')' : '')
                                        };
                                    })}
                                    onChange={(selectedOptions) => handleAddQuestionsToVariable(variable.id, selectedOptions || [])}
                                    options={availableQuestions.map(q => ({
                                        value: q.id,
                                        label: q.question + (q.description ? ' (' + q.description + ')' : '')
                                    }))}
                                    placeholder="Select questions..."
                                    className="mb-2"
                                    styles={{
                                        control: (provided) => ({
                                            ...provided,
                                            borderColor: '#d1d5db',
                                            '&:hover': {
                                                borderColor: '#d1d5db'
                                            },
                                            '&:focus': {
                                                borderColor: '#2563eb',
                                                boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.2)'
                                            }
                                        })
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Model Visualization */}
            {dependentVariable && variables.length > 0 && (
                <div className="mb-8">
                    <h4 className="font-medium mb-4">Model Visualization</h4>
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <div className="flex flex-col items-center">
                            {/* Independent variables in a row */}
                            <div className="flex flex-wrap justify-center gap-4 mb-6">
                                {variables.map((variable) => (
                                    <div key={variable.id} className="text-center p-3 bg-white border-2 border-blue-400 rounded-md shadow-sm min-w-[150px]">
                                        <p className="font-medium text-sm">{variable.name || 'Independent Variable'}</p>
                                        <p className="text-xs text-gray-500">{variable.questions.length} questions</p>
                                    </div>
                                ))}
                            </div>

                            {/* Arrows pointing down */}
                            <div className="flex justify-center w-full mb-4">
                                <div className="text-blue-500 text-2xl">↓ ↓ ↓</div>
                            </div>

                            {/* Dependent variable */}
                            <div className="text-center p-4 bg-white border-2 border-green-500 rounded-md shadow-sm min-w-[180px]">
                                <p className="font-medium text-green-700">{dependentVariable.name || 'Dependent Variable'}</p>
                                <p className="text-xs text-gray-500">{dependentVariable.questions.length} questions</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSaveModel}
                    disabled={!dependentVariable || variables.length === 0}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                    💾 Save Model
                </button>
            </div>
        </div>
    );
}
