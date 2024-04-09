import Link from "next/link";

export default function MadeWithSoulEngine() {
  return (
    <div
      className="text-white text-xs font-extralight flex flex-col sm:flex-row items-center justify-between gap-2 px-9"
    >
      <div>
        <div className="flex gap-2 items-center">
          <svg className="w-4 h-5" width="300" height="380" viewBox="0 0 300 380" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_1_31)">
              <path
                d="M300 287.065H161.766V248.727H299.532L234.545 140.727C257.299 118.597 271.636 87.7403 271.636 53.4545H247.948C247.948 79.013 237.974 102.234 221.922 119.688L149.922 0L77.9221 119.688C61.8701 102.234 51.8961 79.013 51.8961 53.4545H28.2078C28.2078 87.7403 42.3896 118.597 65.2987 140.727L0.467532 248.727H138.234V287.065H0V310.753H138.234V379.169H161.922V310.753H300.156V287.065H300ZM203.844 135.273C188.416 145.403 169.87 151.481 150.078 151.481C130.286 151.481 111.74 145.558 96.3117 135.273L150.078 45.8182L203.844 135.273ZM84.1558 155.532C103.169 167.844 125.766 175.169 150.078 175.169C174.39 175.169 196.987 168 216 155.532L257.766 225.195H42.2338L84 155.532H84.1558Z"
                fill="white"
              />
            </g>
            <defs>
              <clipPath id="clip0_1_31">
                <rect width="300" height="379.169" fill="white" />
              </clipPath>
            </defs>
          </svg>

          <div className="tracking-wide">
            Made with OPEN SOULS
          </div>
        </div>
      </div>
      <div>        
        <Link href="https://discord.gg/opensouls" rel="noopener noreferrer" target="_blank" className="flex gap-2 px-3 py-2 bg-[#5b5bd6] justify-center align-middle transition duration-75 ease-in-out hover:scale-105 hover:shadow-lg">
          <svg
            className="w-4 h-4"
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 640 512"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"></path>
          </svg>

          <div className="tracking-tight font-light">
            Join Discord
          </div>
        </Link>
      </div>
    </div>
  );
}
