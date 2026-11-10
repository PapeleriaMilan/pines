import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export default function NoEncontrado() {
  return (
    <div className="grid min-h-[50vh] place-items-center text-center">
      <div className="grid gap-4">
        <p className="text-primary text-5xl font-bold">404</p>
        <Button asChild>
          <Link to="/">Ver catálogo</Link>
        </Button>
      </div>
    </div>
  );
}
