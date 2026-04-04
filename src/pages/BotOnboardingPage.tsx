import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import FlyingBot from '@/components/FlyingBot';
import BotMessage from '@/components/BotMessage';
import BotContainer from '@/components/BotContainer';
import InteractiveAnswerGroup from '@/components/InteractiveAnswerGroup';
import { botOnboardingMessages, learningStyleQuestions } from '@/i18n/botMessages';

const questionsArray = Object.entries(learningStyleQuestions).map(([key, value]: any) => ({
    id: key,
    question: value.ar,
    options: value.options
}));

export default function BotOnboardingPage() {
    const navigate = useNavigate();
    const [phase, setPhase] = useState<'welcome' | 'explanation' | 'reassurance' | 'questions' | 'result'>('welcome');
    const [messageComplete, setMessageComplete] = useState(false);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [learningStyle, setLearningStyle] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [selectedValue, setSelectedValue] = useState('');

    // Transform question options to expected format
    const getOptionsForQuestion = (questionIndex: number) => {
        const question = questionsArray[questionIndex];
        return Object.entries(question.options).map(([key, value]: any) => ({
            id: key,
            label: value.ar,
        }));
    };

    // Start animation when component mounts
    useEffect(() => {
        setIsVisible(true);
    }, []);

    // Reset selected value when question changes
    useEffect(() => {
        setSelectedValue('');
    }, [currentQuestion]);

    const handleContinue = () => {
        if (phase === "welcome") {
            setPhase("explanation");
            setMessageComplete(false);
        } else if (phase === "explanation") {
            setPhase("reassurance");
            setMessageComplete(false);
        } else if (phase === "reassurance") {
            setPhase("questions");
            setMessageComplete(false);
            setCurrentQuestion(0);
        }
    };

    const handleReadMore = () => {
        // Repeat the explanation
        setPhase("explanation");
        setMessageComplete(false);
    };

    const handleAnswerSubmit = (selectedAnswer: string) => {
        const updatedAnswers = {
            ...answers,
            [questionsArray[currentQuestion].id]: selectedAnswer,
        };
        setAnswers(updatedAnswers);

        if (currentQuestion < questionsArray.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            // Determine learning style based on answers
            const style = determineLearningStyle(updatedAnswers);
            setLearningStyle(style);
            setPhase("result");
            setMessageComplete(false);
        }
    };

    const determineLearningStyle = (answers: Record<string, string>) => {
        // Simple determination based on answers
        const answers_list = Object.values(answers);
        const visualCount = answers_list.filter((a) => a === "visual").length;
        const auditoryCount = answers_list.filter((a) => a === "auditory").length;
        const kinestheticCount = answers_list.filter((a) => a === "kinesthetic").length;

        if (visualCount > auditoryCount && visualCount > kinestheticCount) return "visual";
        if (auditoryCount > visualCount && auditoryCount > kinestheticCount) return "auditory";
        return "kinesthetic";
    };

    const handleFinish = () => {
        // Redirect to dashboard or learning page
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
            {/* Main Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={`phase-${phase}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="min-h-screen flex items-center justify-center px-4 py-8"
                >
                    <BotContainer showProgress={true} currentStep={phase === 'questions' ? currentQuestion + 1 : 0} totalSteps={questionsArray.length}>
                        {/* Welcome Phase */}
                        {phase === "welcome" && (
                            <div className="space-y-6">
                                <FlyingBot expression="welcome" size="md" isFlying={false} />
                                <div className="space-y-4">
                                    <BotMessage
                                        text={botOnboardingMessages.welcome.ar}
                                        emoji="👋"
                                        isTyping={true}
                                        onComplete={() => setMessageComplete(true)}
                                    />
                                    {messageComplete && (
                                        <motion.button
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            onClick={handleContinue}
                                            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all"
                                        >
                                            فهمت ✓
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Explanation Phase */}
                        {phase === "explanation" && (
                            <div className="space-y-6">
                                <FlyingBot expression="thinking" size="md" isFlying={false} />
                                <div className="space-y-4">
                                    <BotMessage
                                        text={botOnboardingMessages.explanation.ar}
                                        emoji="💭"
                                        isTyping={true}
                                        onComplete={() => setMessageComplete(true)}
                                    />
                                    {messageComplete && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex gap-3"
                                        >
                                            <motion.button
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                onClick={handleContinue}
                                                className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all"
                                            >
                                                فهمت ✓
                                            </motion.button>
                                            <motion.button
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                onClick={handleReadMore}
                                                className="flex-1 px-6 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition-all"
                                            >
                                                شرح أكثر
                                            </motion.button>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Reassurance Phase */}
                        {phase === "reassurance" && (
                            <div className="space-y-6">
                                <FlyingBot expression="encouraging" size="md" isFlying={false} />
                                <div className="space-y-4">
                                    <BotMessage
                                        text={botOnboardingMessages.reassurance.ar}
                                        emoji="💪"
                                        isTyping={true}
                                        onComplete={() => setMessageComplete(true)}
                                    />
                                    {messageComplete && (
                                        <motion.button
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            onClick={handleContinue}
                                            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all"
                                        >
                                            {botOnboardingMessages.buttonStart.ar}
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Questions Phase */}
                        {phase === "questions" && (
                            <div className="space-y-6">
                                <FlyingBot expression="thinking" size="md" isFlying={false} />
                                <div className="space-y-4">
                                    <BotMessage
                                        text={`سؤال ${currentQuestion + 1} من ${questionsArray.length}`}
                                        emoji="â“"
                                        isTyping={true}
                                    />
                                    <div className="bg-white/50 p-6 rounded-lg border border-purple-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                            {questionsArray[currentQuestion].question}
                                        </h3>
                                        <InteractiveAnswerGroup
                                            options={getOptionsForQuestion(currentQuestion)}
                                            selectedValue={selectedValue}
                                            onValueChange={(value) => {
                                                setSelectedValue(value);
                                                handleAnswerSubmit(value);
                                            }}
                                            isRTL={true}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Result Phase */}
                        {phase === "result" && (
                            <div className="space-y-6">
                                <FlyingBot expression="celebrating" size="md" isFlying={false} />
                                <div className="space-y-4">
                                    <BotMessage
                                        text={`مبروك! أسلوبك التعليمي هو: ${learningStyle}`}
                                        emoji="🎉"
                                        isTyping={true}
                                        onComplete={() => setMessageComplete(true)}
                                    />
                                    {messageComplete && (
                                        <motion.button
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            onClick={handleFinish}
                                            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all"
                                        >
                                            ابدأ الآن! 🚀
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        )}
                    </BotContainer>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
