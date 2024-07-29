import React from 'react';
import { FaTwitter, FaLinkedin } from 'react-icons/fa';
import { SiMastodon, SiThreads } from 'react-icons/si';

interface SocialShareButtonsProps {
  url: string;
  title: string;
}

const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({ url, title }) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex space-x-2">
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-600"
      >
        <FaTwitter size={24} />
      </a>
      <a
        href={`https://www.linkedin.com/shareArticle?url=${encodedUrl}&title=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-700 hover:text-blue-900"
      >
        <FaLinkedin size={24} />
      </a>
      <a
        href={`https://mastodon.social/share?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-purple-500 hover:text-purple-600"
      >
        <SiMastodon size={24} />
      </a>
      <a
        href={`https://threads.net/intent/post?text=${encodeURIComponent(title + ' ' + url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-black hover:text-gray-700"
      >
        <SiThreads size={24} />
      </a>
    </div>
  );
};

export default SocialShareButtons;
