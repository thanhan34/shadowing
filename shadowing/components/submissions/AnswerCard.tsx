import React from 'react';
import { Answer, Question } from '../../types/placement-test';

interface AnswerCardProps {
  questionId: string;
  answer: Answer;
  question?: Question;
  audioUrl?: string;
  isLoadingAudio?: boolean;
  audioError?: string;
  onRetryAudio?: (url: string) => Promise<void>;
}

const AnswerCard: React.FC<AnswerCardProps> = ({
  questionId,
  answer,
  question,
  audioUrl,
  isLoadingAudio,
  audioError,
  onRetryAudio,
}) => {
  const renderAudioPlayer = (url: string) => {
    return (
      <div className="mb-4 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          {isLoadingAudio ? (
            <span className="text-sm text-[#fd7f33]">Loading...</span>
          ) : audioError ? (
            <button
              onClick={() => onRetryAudio?.(url)}
              className="text-sm text-red-600 hover:text-red-700"
            >
              {audioError} - Click to retry
            </button>
          ) : null}
        </div>
        {audioUrl && !audioError && (
          <audio 
            controls 
            src={audioUrl}
            className="w-full"
            preload="auto"
          >
            Your browser does not support the audio element.
          </audio>
        )}
      </div>
    );
  };

  const questionNum = parseInt(questionId);
  console.log('Question Data:', {
    questionId,
    answer: answer.answer,
    correctAnswers: question?.correctAnswers,
    options: question?.options,
    content: question?.content,
    text: question?.text,
    question: question
  });

  // Different question types
  const isRWFIB = questionNum >= 4 && questionNum <= 6;
  const isRFIB = questionNum >= 7 && questionNum <= 9;
  const isWFD = questionNum >= 10 && questionNum <= 12;

  if (isWFD) {
    // WFD format
    return (
      <div className="mb-8 bg-[#242424] p-6 rounded">
        <div className="mb-6">
          <h4 className="text-2xl font-medium text-[#fc5d01]">Question {questionId}</h4>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[#fc5d01] font-medium mb-2">Correct Text:</p>
            <div className="text-white bg-[#2a2a2a] p-4 rounded">
              {question?.text || answer.text || answer.content}
            </div>
          </div>

          <div>
            <p className="text-[#fc5d01] font-medium mb-2">Your Answer:</p>
            <div className="text-white bg-[#2a2a2a] p-4 rounded">
              {answer.answer}
            </div>
          </div>
          
          <div>
            <p className="text-[#fc5d01] font-medium">Total Correct: {
              (() => {
                const correctText = question?.text || answer.text || answer.content || '';
                console.log('WFD Correct Text:', {
                  questionText: question?.text,
                  finalText: correctText,
                  userAnswer: answer.answer
                });
                // Clean and normalize text (remove punctuation, convert to lowercase)
                const cleanText = (text: string) => {
                  return text
                    .toLowerCase()
                    .replace(/[.,!?;:'"]/g, '')  // Remove punctuation
                    .split(/\s+/)                // Split on whitespace
                    .filter(Boolean);            // Remove empty strings
                };

                const correctWordsLower = cleanText(correctText);
                const userWordsLower = cleanText(answer.answer);
                let correctCount = 0;

                // Track used words
                const usedCorrect = new Set<number>();
                const usedUser = new Set<number>();

                // Find exact matches
                userWordsLower.forEach((userWord, userIdx) => {
                  correctWordsLower.forEach((correctWord, correctIdx) => {
                    if (!usedUser.has(userIdx) && !usedCorrect.has(correctIdx) && userWord === correctWord) {
                      correctCount++;
                      usedCorrect.add(correctIdx);
                      usedUser.add(userIdx);
                    }
                  });
                });

                console.log('Word comparison:', {
                  correctWords: cleanText(correctText),
                  userWords: cleanText(answer.answer),
                  correctCount,
                  totalWords: cleanText(correctText).length
                });

                return `${correctCount} / ${cleanText(correctText).length}`;
              })()
            }</p>
          </div>
        </div>
      </div>
    );
  }

  if (isRWFIB || isRFIB) {
    return (
      <div className="mb-8 bg-[#242424] p-6 rounded">
        <div className="mb-6">
          <h4 className="text-2xl font-medium text-[#fc5d01]">Question {questionId}</h4>
        </div>

        <div className="text-white mb-6">
          <div>
            <p className="text-[#fc5d01] font-medium mb-2">Question Text:</p>
            <div className="bg-[#2a2a2a] p-4 rounded">
              {answer.content.split('_____').map((part, index, array) => (
                <React.Fragment key={index}>
                  {part}
                  {index < array.length - 1 && (
                    <span className="px-2 py-1 mx-1 bg-[#fc5d01] text-white rounded">
                      {answer.answer.split(',')[index] || 'blank'}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {isRWFIB ? (
            <div>
              <p className="text-[#fc5d01] font-medium mb-4">Options:</p>
              {answer.content.split('_____').slice(0, -1).map((_, blankIndex) => {
                const options = Array.isArray(answer.options) ? 
                  answer.options.slice(blankIndex * 4, (blankIndex + 1) * 4) : 
                  answer.allOptions?.slice(blankIndex * 4, (blankIndex + 1) * 4) || [];
                
                return (
                  <div key={blankIndex} className="mb-4">
                    <p className="text-white mb-2">Blank {blankIndex + 1}:</p>
                    <div className="flex gap-2 flex-wrap">
                      {options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`px-3 py-1 rounded ${
                            option === answer.answer.split(',')[blankIndex]
                              ? 'bg-[#fc5d01] text-white'
                              : 'bg-[#2a2a2a] text-white'
                          }`}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div>
              <p className="text-[#fc5d01] font-medium mb-4">Options:</p>
              <div className="flex gap-2 flex-wrap">
                {(() => {
                  const options = Array.isArray(answer.options) ? answer.options : 
                    Array.isArray(answer.allOptions) ? answer.allOptions : [];
                  return options.map((option: string, index: number) => (
                    <div
                      key={index}
                      className={`px-3 py-1 rounded ${
                        answer.answer.split(',').includes(option)
                          ? 'bg-[#fc5d01] text-white'
                          : 'bg-[#2a2a2a] text-white'
                      }`}
                    >
                      {option}
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[#fc5d01] font-medium mb-2">Your Answer:</p>
            <div className="text-white">
              {answer.answer}
            </div>
          </div>
          
          <div>
            <p className="text-[#fc5d01] font-medium">Total Correct: {
              (() => {
                if (isRFIB) {
                  // For RFIB, check if user's answers are in the options
                  const userAnswers = answer.answer.split(',').map(a => a.trim());
                  const options = Array.isArray(answer.options) ? answer.options : 
                    Array.isArray(answer.allOptions) ? answer.allOptions : [];
                  let correctCount = 0;

                  // Count how many user answers are in the options
                  userAnswers.forEach(userAnswer => {
                    if (options.includes(userAnswer)) {
                      correctCount++;
                    }
                  });

                  // Total possible is the number of blanks in the question
                  const totalBlanks = answer.content.split('_____').length - 1;
                  return `${correctCount} / ${totalBlanks}`;
                } else {
                  // For RWFIB, count highlighted options
                  const userAnswers = answer.answer.split(',').map(a => a.trim());
                  const blanks = answer.content.split('_____').slice(0, -1);
                  let correctCount = 0;

                  blanks.forEach((_, index) => {
                    const userAnswer = userAnswers[index];
                    const options = Array.isArray(answer.options) ? 
                      answer.options.slice(index * 4, (index + 1) * 4) : 
                      answer.allOptions?.slice(index * 4, (index + 1) * 4) || [];
                    
                    if (options.includes(userAnswer)) {
                      correctCount++;
                    }
                  });

                  return `${correctCount} / ${blanks.length}`;
                }
              })()
            }</p>
          </div>
        </div>
      </div>
    );
  }

  // Read Aloud questions (1-3)
  return (
    <div className="mb-8 bg-[#242424] p-6 rounded">
      <div className="mb-6">
        <h4 className="text-2xl font-medium text-[#fc5d01]">Question {questionId}</h4>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-[#fc5d01] font-medium mb-2">Question Text:</p>
          <div className="text-white bg-[#2a2a2a] p-4 rounded">
            {question?.content || answer.content || 'No text available'}
          </div>
        </div>

        <div>
          <p className="text-[#fc5d01] font-medium mb-2">Your Recording:</p>
          {audioUrl ? (
            renderAudioPlayer(answer.answer)
          ) : (
            <div className="text-white bg-[#2a2a2a] p-4 rounded">
              No recording available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnswerCard;
