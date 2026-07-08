import { useEffect, useState } from "react";

import {
  inquiryApi,
  type InquiryType,
} from "@/shared/newsroll/api";
import { currentUserId } from "@/shared/newsroll/auth/current-user";
import {
  PrimaryButton,
  PrimaryButtonGroup,
  SelectButton,
  TextInput,
  Textarea,
} from "@/design-system/components";
import { ConfirmDialog } from "@/features/shared/ConfirmDialog";
import { DataUnavailableMessage } from "@/features/shared/DataUnavailableMessage";

export function InfoInquirySection({ items }: { items: InquiryType[] }) {
  const [selectedInquiryType, setSelectedInquiryType] = useState(
    items[0]?.label ?? "",
  );
  const [inquiryTitle, setInquiryTitle] = useState("");
  const [inquiryContent, setInquiryContent] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [inquiryStatus, setInquiryStatus] = useState<"error" | "sent" | "sending" | null>(
    null,
  );
  const [isInquiryTypeOpen, setIsInquiryTypeOpen] = useState(false);
  const inquiryTypeMenuId = "info-inquiry-type-menu";

  useEffect(() => {
    if (items.length > 0 && !items.some((item) => item.label === selectedInquiryType)) {
      setSelectedInquiryType(items[0].label);
    }
  }, [items, selectedInquiryType]);

  if (items.length === 0) {
    return (
      <section className="container_infoList wrapper_scrollList" aria-label="1:1 문의">
        <DataUnavailableMessage target="문의 유형" />
      </section>
    );
  }

  return (
    <form
      className="wrapper_infoInquiry wrapper_panelContent"
      aria-label="1:1 문의"
      onSubmit={(event) => {
        event.preventDefault();

        const selectedType = items.find((item) => item.label === selectedInquiryType);

        if (!selectedType || !inquiryTitle.trim() || !inquiryContent.trim()) {
          setInquiryStatus("error");
          return;
        }

        setInquiryStatus("sending");
        inquiryApi
          .createInquiry({
            content: inquiryContent.trim(),
            title: inquiryTitle.trim(),
            typeId: selectedType.id,
            userId: currentUserId,
          })
          .then(() => {
            setInquiryTitle("");
            setInquiryContent("");
            setInquiryStatus(null);
            setConfirmMessage("문의가 등록되었습니다.");
          })
          .catch(() => {
            setInquiryStatus("error");
          });
      }}
    >
      <label className="wrapper_contentMeta wrapper_fieldStack u_w100">
        <span className="text_infoFieldLabel">문의 유형</span>
        <SelectButton
          ariaLabel="문의 유형"
          isOpen={isInquiryTypeOpen}
          listboxId={inquiryTypeMenuId}
          onChange={setSelectedInquiryType}
          onOpenChange={setIsInquiryTypeOpen}
          options={items.map((type) => ({
            label: type.label,
            value: type.label,
          }))}
          size="default"
          value={selectedInquiryType}
        />
      </label>
      <div className="wrapper_contentMeta wrapper_fieldStack u_w100">
        <span className="text_infoFieldLabel">제목</span>
        <TextInput
          aria-label="문의 제목"
          onChange={(event) => setInquiryTitle(event.target.value)}
          placeholder="문의 제목을 입력해주세요."
          type="text"
          value={inquiryTitle}
        />
      </div>
      <div className="wrapper_contentMeta wrapper_fieldStack u_w100">
        <span className="text_infoFieldLabel">내용</span>
        <Textarea
          aria-label="문의 내용"
          onChange={(event) => setInquiryContent(event.target.value)}
          placeholder="문의 내용을 자세히 작성해주세요."
          rows={7}
          value={inquiryContent}
          variant="inquiry"
        />
      </div>
      {inquiryStatus === "error" ? (
        <p className="text_infoSubmitStatus is_error" role="alert">
          문의 내용을 확인해주세요.
        </p>
      ) : null}
      <PrimaryButtonGroup>
        <PrimaryButton
          disabled={inquiryStatus === "sending"}
          type="submit"
        >
        {inquiryStatus === "sending" ? "보내는 중" : "문의하기"}
        </PrimaryButton>
      </PrimaryButtonGroup>
      {confirmMessage ? (
        <ConfirmDialog
          message={confirmMessage}
          onConfirm={() => setConfirmMessage("")}
        />
      ) : null}
    </form>
  );
}
