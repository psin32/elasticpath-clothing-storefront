import { Extensions } from "@moltin/sdk";

interface IGeneralInfo {
  extensions: Extensions;
}

const GeneralInfo = ({ extensions }: IGeneralInfo): JSX.Element => {
  const highlights: (string | number | boolean)[] = extensions?.["products(general)"] && Object.values(extensions?.["products(general)"])?.flat();
  return (
    highlights && (
      <div className="flex flex-col gap-4 sm:gap-6 pt-8">
        <div>
          <span className="mb-4 text-base font-medium uppercase text-gray-800 lg:text-lg">
            Product Highlights
          </span>
          <dl>
            <ul className="list-disc ml-6 mt-4" key="highlights">
              {highlights.map((highlight: string | number | boolean, index: number) => {
                return (
                  highlight && <li key={index}>{highlight}</li>
                )
              })}
            </ul>
          </dl>
        </div>
      </div>
    )
  );
};

export default GeneralInfo;
