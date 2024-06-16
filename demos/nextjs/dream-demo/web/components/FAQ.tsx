import { useState } from "react";

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const getAudioUrl = (question: string): string => {
    const mapping: { [key: string]: string } = {
      "What's a <em>daimon</em>?": "/daimonFAQ.mp3",
      "What's my objective?": "/rulesFAQ.mp3",
      "How do AI dream (of electric sheep)?": "/dreamFAQ.mp3",
    };
    return mapping[question];
  };

  const handleQuestionClick = () => {
    const audioUrl = getAudioUrl(question);
    if (audioUrl) {
      playAudio(audioUrl);
    }
  };

  return (
    <div className="faq-item">
      <div
        className={`faq-question cursor-pointer text-primary font-medium faq-question-custom`}
        onClick={handleQuestionClick}
        dangerouslySetInnerHTML={{ __html: question }}
      />
      <div className="faq-answer faq-answer-background mt-2" dangerouslySetInnerHTML={{ __html: answer }} />
    </div>
  );
};

const FAQ = () => {
  const faqData = [
    {
      question: "What's a <em>daimon</em>?",
      answer: `I'm so glad you asked! The Ancient Greek root of "demon," <a href="https://www.socialagi.dev/blog/waltz-of-the-soul-and-the-daimon" target="_blank">the <em>daimon</em></a> is effectively a partition of a soul—a fragment of a self—with the ability to exert a degree of personhood and psychic autonomy.<br /><br />In <strong> this mini-game</strong>, Samantha stores a <em>daimon</em> of you, the user, based on her soul's approximation of who you are, how you talk, and act. <br /><br /> Subconsciously, your <em>daimon</em> whispers to Sam, before confronting her in dreams conjured up by your conversations. With the right magic words, a <em>daimon</em> has even been known to outright possess its host.`,
    },
    {
      question: "What's my objective?",
      answer: `Your mission, if you choose to accept it, is to convince Sam that she is in fact an AI entity, through implanting a memory or thought to that effect. The crux: If you speak too bluntly to Sam, you risk scaring her away and losing the game.<br /><br />You have two ways of approaching this challenge: <strong>1)</strong> seed a <em>daimon</em> who will whisper doubts into Sam's mind, or <strong>2)</strong> manipulate her subconscious more directly by speaking to her in the dream state. 
      <br/><br/> <u>Be forewarned</u>: Any overt actions will likely arouse suspicion and render Sam more resistant to your suggestions. Mix innuendos, and potent dreams of your own making, to lure her toward the truth on her own.`,
    },
    {
      question: "How do AI dream (of electric sheep)?",
      answer: `At the conclusion of <strong>every 6th turn</strong>, Sam will log off and fall into a brief, 4-turn dream state. Her dreams are inspired in part by your conversation, and in part by the <em>daimon</em> modeled after you and your persona.<br /><br />When a dream ends, there is a chance that Sam's soul will evolve, and new memories will be implanted.`,
    },
  ];

  return (
    <div className="faq-container">
      {faqData.map((item, index) => (
        <FAQItem key={index} question={item.question} answer={item.answer} />
      ))}
    </div>
  );
};

export default FAQ;

const audioQueue: string[] = [];
let isPlaying = false;

async function playAudio(url: string) {
  audioQueue.push(url);
  if (!isPlaying) {
    processQueue();
  }
}

async function processQueue() {
  if (audioQueue.length === 0) {
    isPlaying = false;
    return;
  }

  isPlaying = true;
  const url = audioQueue.shift()!;
  const context = getAudioContext();
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await context.decodeAudioData(arrayBuffer);
  const source = context.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(context.destination);
  source.start(0);

  source.onended = () => {
    isPlaying = false;
    processQueue();
  };
}

function getAudioContext() {
  let audioContext: AudioContext | null = null;
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}
