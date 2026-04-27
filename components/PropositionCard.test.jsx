import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import PropositionCard from "./PropositionCard";

describe("PropositionCard Component", () => {
  it("should render title and image correctly", () => {
    const props = {
      title: "Safari en Afrique",
      imageUrl: "http://example.com/safari.jpg"
    };

    render(<PropositionCard {...props} />);

    expect(screen.getByText(props.title)).toBeInTheDocument();
    const image = screen.getByAltText(props.title);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", props.imageUrl);
  });
});
