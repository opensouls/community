"use client"

import { useEffect, useState } from "react";
import { useSoul } from "./SoulProvider";
import { ActionEvent } from "@opensouls/soul";

const defaultRegex = 'I\\sam\\sREGEX';

const RegexInput: React.FC = () => {
  const soul = useSoul()
  const [inputValue, setInputValue] = useState(defaultRegex);
  const [buttonDisabled, setButtonDisabled] = useState(false)
  const [thought, setThought] = useState("Reggie is a living regex. Help him find himself.");

  useEffect(() => {

    const onSays = async (speech: ActionEvent) => {
      console.log("on says", speech)
      setButtonDisabled(true)
      for await (const txt of speech.stream()) {
        setThought((thought) => (thought + txt).trim())
      }
      setButtonDisabled(false)
    }
    soul.on("says", onSays)

    return () => {
      soul.off("says", onSays)
    }

  }, [soul]);

  const doSubmit = () => {
    if (!inputValue) {
      console.log('not dispatching, blank regex')
      return;
    }
    setButtonDisabled(true)
    setThought("...")
    console.log("dispatching regexChanged", inputValue);
    soul.dispatch({
      action: "regexChanged",
      content: inputValue,
      name: "Reggie",
    });
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-white">
      <div className="flex items-center justify-center bg-reggie-purple rounded-full p-6 mx-6 min-h-[76px]">
        <p className="text-lg text-md border-1 border-gray-200 text-white placeholder-white text-center px-5">{thought}</p>
      </div>
      <div className="flex items-center justify-center h-full space-x-2 mt-10 mx-6">
        <span className="text-4xl">/</span>
        <div className="flex items-center justify-center">
          <input
            type="text"
            className="w-full h-full p-5 text-2xl md:text-6xl border-1 border-gray-200 bg-background text-white placeholder-white text-center"
            defaultValue={defaultRegex}
            onChange={handleInputChange}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                doSubmit();
              }
            }}
          />
        </div>
        <span className="text-4xl">/</span>
      </div>
      <div className="relative inline-flex group mt-10">
        <div
          className="animate-breathing absolute transitiona-all duration-1000 opacity-70 -inset-px bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-md group-hover:opacity-100 group-hover:-inset-1 group-hover:duration-200 animate-tilt">
        </div>
        <button title="Compile"
          className="disabled:opacity-0 cursor-pointer relative inline-flex items-center justify-center px-4 py-2 text-lg text-white transition-all duration-200 bg-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          role="button"
          onClick={doSubmit}
          disabled={buttonDisabled}
        >
          compile
        </button>
      </div>


    </div>
  )
}

export default RegexInput;