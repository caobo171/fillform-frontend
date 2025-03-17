import { WordReviewListeningExercise } from "@/store/types";

export default function ProgressBar({
    exercises,
    currentExerciseIndex,
    setCurrentExerciseIndex
}: { exercises: WordReviewListeningExercise[], currentExerciseIndex: number, setCurrentExerciseIndex: (index: number) => void }) {
    return (
        <nav aria-label="Progress" className="flex items-start justify-center">
            <p className="text-sm font-medium">
                Bài {currentExerciseIndex + 1} trong {exercises.length} bài ôn tập
            </p>
            <ol role="list" className="ml-8 flex items-center space-x-5 max-w-[700px] flex-wrap gap-4">
                {exercises.map((step, index) => (
                    <li className="cursor-pointer" key={step.id} onClick={() => setCurrentExerciseIndex(index)}>
                        {step.status === 1 ? (
                            <a className="block h-2.5 w-2.5 rounded-full bg-green-600 hover:bg-green-900">

                            </a>
                        ) : index === currentExerciseIndex ? (
                            <a aria-current="step" className="relative flex items-center justify-center">
                                <span aria-hidden="true" className="absolute flex h-5 w-5 p-px">
                                    <span className="h-full w-full rounded-full bg-green-200" />
                                </span>
                                <span aria-hidden="true" className="relative block h-2.5 w-2.5 rounded-full bg-green-600" />

                            </a>
                        ) : (
                            <a className="block h-2.5 w-2.5 rounded-full bg-gray-200 hover:bg-gray-400">

                            </a>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    )
}
