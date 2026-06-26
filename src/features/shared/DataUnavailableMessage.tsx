export function getDataUnavailableMessage(target: string, particle = "을") {
  return `${target}${particle} 불러오지 못했습니다.`;
}

export function DataUnavailableMessage({
  particle,
  target,
}: {
  particle?: string;
  target: string;
}) {
  return (
    <p className="text_commentEmpty">
      {getDataUnavailableMessage(target, particle)}
    </p>
  );
}
