import { Link } from 'react-router-dom';

interface PartnerCardProps {
  name: string;
  logo_url: string;
  slug: string;
  website_url: string;
  description?: string;
}

export const PartnerCard = ({ name, logo_url, slug, website_url, description }: PartnerCardProps) => {
  return (
    <Link
      to={`/partnerzy/${slug}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col h-full"
    >
      <div className="flex-1 flex items-center justify-center mb-4">
        <img
          src={logo_url}
          alt={`Logo ${name}`}
          className="max-h-24 w-auto object-contain"
        />
      </div>
      {description && (
        <div className="mt-auto">
          <p className="text-sm text-gray-600 line-clamp-4 text-center">
            {description.length > 250 ? `${description.slice(0, 250)}...` : description}
          </p>
        </div>
      )}
    </Link>
  );
};
