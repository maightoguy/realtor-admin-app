export default function Contact() {
  return (
    <section
      id="contact"
      className="bg-[#FAFAFA] px-6 py-12 md:px-28 md:py-16 flex flex-col items-center gap-12"
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between md:gap-20 w-full max-w-6xl">
        {/* Left Section */}
        <div className="max-w-xs flex flex-col gap-4 mb-5">
          <h2 className="text-xl md:text-2xl font-bold text-black">
            Get in touch with our team
          </h2>
          <p className="text-sm md:text-base text-gray-500">
            You can always reach out to us through any of the channels provided
            here
          </p>
        </div>

        {/* Right Section (Cards) */}
        <div className="flex flex-col md:flex-row gap-6 flex-1">
          {/* Email Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-25 flex-1">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center">
              {/* Email icon */}
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 11.5596V22.9996C2 24.0604 2.42143 25.0779 3.17157 25.828C3.92172 26.5781 4.93913 26.9996 6 26.9996H26C27.0609 26.9996 28.0783 26.5781 28.8284 25.828C29.5786 25.0779 30 24.0604 30 22.9996V11.5596L18.096 18.8836C17.4657 19.2714 16.7401 19.4767 16 19.4767C15.2599 19.4767 14.5343 19.2714 13.904 18.8836L2 11.5596Z"
                  fill="black"
                />
                <path
                  d="M30 9.21067V9C30 7.93913 29.5786 6.92172 28.8284 6.17157C28.0783 5.42143 27.0609 5 26 5H6C4.93913 5 3.92172 5.42143 3.17157 6.17157C2.42143 6.92172 2 7.93913 2 9V9.21067L14.952 17.1813C15.2672 17.3752 15.63 17.4779 16 17.4779C16.37 17.4779 16.7328 17.3752 17.048 17.1813L30 9.21067Z"
                  fill="black"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-medium text-black">Email</h3>
              <p className="text-sm text-gray-500">
                Get the latest updates and offers.
              </p>
              <a
                href="mailto:info@veriplot.com"
                className="block mt-2 text-sm font-medium text-gray-900"
              >
                info@veriplot.com
              </a>
            </div>
          </div>

          {/* Address Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-25 flex-1">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center ">
              {/* Location icon */}
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.3867 29.8013L15.48 29.8547L15.5173 29.876C15.6654 29.9561 15.831 29.998 15.9993 29.998C16.1676 29.998 16.3333 29.9561 16.4813 29.876L16.5187 29.856L16.6133 29.8013C17.1348 29.4921 17.6437 29.1621 18.1387 28.812C19.4201 27.9073 20.6174 26.889 21.716 25.7693C24.308 23.116 27 19.1293 27 14C27 11.0826 25.8411 8.28473 23.7782 6.22183C21.7153 4.15893 18.9174 3 16 3C13.0826 3 10.2847 4.15893 8.22183 6.22183C6.15893 8.28473 5 11.0826 5 14C5 19.128 7.69333 23.116 10.284 25.7693C11.3822 26.8889 12.579 27.9072 13.86 28.812C14.3554 29.1621 14.8647 29.4921 15.3867 29.8013ZM16 18C17.0609 18 18.0783 17.5786 18.8284 16.8284C19.5786 16.0783 20 15.0609 20 14C20 12.9391 19.5786 11.9217 18.8284 11.1716C18.0783 10.4214 17.0609 10 16 10C14.9391 10 13.9217 10.4214 13.1716 11.1716C12.4214 11.9217 12 12.9391 12 14C12 15.0609 12.4214 16.0783 13.1716 16.8284C13.9217 17.5786 14.9391 18 16 18Z"
                  fill="black"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-medium text-black">Address</h3>
              <p className="text-sm text-gray-500">
                21 Fewomi Crescent Phase 3 Kubwa Abuja, Nigeria
              </p>
              <a
                href="https://maps.google.com/?q=21+fewomi+crescent+phase+3+kubwa+Abuja+Nigeria"
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-2 text-sm font-medium text-gray-900"
              >
                View on map
              </a>
            </div>
          </div>

          {/* Phone Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-25 flex-1">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center">
              {/* Phone icon */}
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M28.985 21.8847C28.7621 23.5785 27.9303 25.1333 26.6449 26.2586C25.3595 27.3839 23.7084 28.0028 22 27.9997C12.075 27.9997 4.00001 19.9247 4.00001 9.99975C3.99695 8.29136 4.61587 6.64028 5.74118 5.35487C6.86649 4.06946 8.42122 3.23763 10.115 3.01475C10.5433 2.96245 10.9771 3.05007 11.3515 3.26455C11.7259 3.47902 12.0209 3.80883 12.1925 4.20475L14.8325 10.0985V10.1135C14.9639 10.4166 15.0181 10.7474 14.9904 11.0766C14.9627 11.4057 14.8539 11.7229 14.6738 11.9997C14.6513 12.0335 14.6275 12.0647 14.6025 12.096L12 15.181C12.9363 17.0835 14.9263 19.056 16.8538 19.9947L19.8963 17.406C19.9261 17.3809 19.9574 17.3575 19.99 17.336C20.2666 17.1515 20.5849 17.0389 20.916 17.0083C21.2471 16.9778 21.5806 17.0302 21.8863 17.161L21.9025 17.1685L27.7913 19.8072C28.1879 19.9782 28.5185 20.273 28.7337 20.6474C28.9489 21.0219 29.037 21.456 28.985 21.8847Z"
                  fill="#222222"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-medium text-black">Phone</h3>
              <p className="text-sm text-gray-500">
                Speak to our team for support.
              </p>
              <a
                href="tel:+2347075103141"
                className="block mt-2 text-sm font-medium text-gray-900"
              >
                +234 707 510 3141
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
