import React from "react";
import Image from "next/image";
import { FaInstagram, FaLinkedin, FaEnvelope, FaExternalLinkAlt } from "react-icons/fa";

const FooterBar = () => {
  return (
    <footer className="bg-black text-gray-300 py-10 mt-auto text-center">
      <div className="max-w-3xl mx-auto px-6">

        {/* Logo instead of text */}
        <div className="flex justify-center">
          <Image 
            src="/logo.png"  // 👉 replace with your logo path in public folder
            alt="Matrix Club Logo"
            width={120}
            height={120}
            className="object-contain"
          />
        </div>

        {/* Description */}
        <p className="mt-4 text-sm text-gray-400">
          Exploring the mathematical foundations of modern technology <br />
          through matrix theory and applications.
        </p>

        {/* Social Media Icons */}
        <div className="flex justify-center space-x-6 mt-6">
          <a href="https://instagram.com" target="_blank" className="hover:text-green-500">
            <FaInstagram size={22} />
          </a>
          <a href="https://linkedin.com" target="_blank" className="hover:text-green-500">
            <FaLinkedin size={22} />
          </a>
          <a href="mailto:matrixclub@example.com" className="hover:text-green-500">
            <FaEnvelope size={22} />
          </a>
        </div>

        {/* Join Us Button */}
        <div className="mt-6">
          <a
            href="#"
            target="_blank"
            className="inline-flex items-center px-5 py-2 rounded-full bg-green-500 text-black font-semibold hover:bg-green-600 transition"
          >
            Join Us <FaExternalLinkAlt className="ml-2" size={14} />
          </a>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700 mt-10 pt-4 text-sm text-gray-500">
        © {new Date().getFullYear()} Matrix Club. All rights reserved.
      </div>
    </footer>
  );
};

export default FooterBar;
