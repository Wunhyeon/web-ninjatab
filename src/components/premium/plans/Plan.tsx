import { NewPlan } from "@/lib/types";
import React from "react";

const Plan = ({ plan }: { plan: NewPlan }) => {
  const { description, product_name, name, price } = plan;

  return (
    <div>
      <h2>
        {product_name} ({name})
      </h2>

      {description ? (
        <div
          dangerouslySetInnerHTML={{
            // Ideally sanitize the description first.
            __html: description,
          }}
        ></div>
      ) : null}

      <p>${price}</p>
    </div>
  );
};

export default Plan;
