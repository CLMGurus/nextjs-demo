import { Loader2 } from "lucide-react";

const Loading = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      <span className="ml-2 text-gray-600">Loading...</span>
    </div>
  );
};

export default Loading;
