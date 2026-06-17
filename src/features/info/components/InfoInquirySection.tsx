import { useEffect, useState } from "react";

import {
  inquiryApi,
  type InquiryType,
} from "@/app/_newsroll/api";
import { currentUserId } from "@/app/_newsroll/auth/current-user";
import {
  Button,
  Icon,
  NewsRollDropdownArrow,
  TextInput,
  Textarea,
} from "@/design-system/components";
import { DataUnavailableMessage } from "@/features/shared/DataUnavailableMessage";

export function InfoInquirySection({ items }: { items: InquiryType[] }) {
  const [selectedInquiryType, setSelectedInquiryType] = useState(
    items[0]?.label ?? "",
  );
  const [inquiryTitle, setInquiryTitle] = useState("");
  const [inquiryContent, setInquiryContent] = useState("");
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
      <section className="container_infoList" aria-label="1:1 문의">
        <DataUnavailableMessage target="문의 유형" />
      </section>
    );
  }

  return (
    <form
      className="wrapper_infoInquiry"
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
            setInquiryStatus("sent");
          })
          .catch(() => {
            setInquiryStatus("error");
          });
      }}
    >
      <label className="wrapper_infoField">
        <span className="text_infoFieldLabel">문의 유형</span>
        <div className="wrapper_infoSelectControl">
          <button
            aria-controls={isInquiryTypeOpen ? inquiryTypeMenuId : undefined}
            aria-expanded={isInquiryTypeOpen}
            aria-haspopup="listbox"
            aria-label="문의 유형"
            className="btn_commentDropdown select_infoField"
            onClick={() => setIsInquiryTypeOpen((current) => !current)}
            type="button"
          >
            {selectedInquiryType}
            <NewsRollDropdownArrow />
          </button>
          {isInquiryTypeOpen ? (
            <div
              className="listbox_commentDropdown listbox_infoInquiryType"
              id={inquiryTypeMenuId}
              role="listbox"
            >
              {items.map((type) => (
                <button
                  aria-selected={selectedInquiryType === type.label}
                  key={type.id}
                  onClick={() => {
                    setSelectedInquiryType(type.label);
                    setIsInquiryTypeOpen(false);
                  }}
                  role="option"
                  type="button"
                >
                  {type.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </label>
      <div className="wrapper_infoField">
        <span className="text_infoFieldLabel">제목</span>
        <TextInput
          aria-label="문의 제목"
          inputSize="large"
          onChange={(event) => setInquiryTitle(event.target.value)}
          placeholder="문의 제목을 입력해주세요."
          radius="rounded"
          type="text"
          value={inquiryTitle}
          variant="outline"
          wrapperClassName="input_commentComposer"
        />
      </div>
      <div className="wrapper_infoField">
        <span className="text_infoFieldLabel">내용</span>
        <Textarea
          aria-label="문의 내용"
          className="textarea_infoComposer"
          onChange={(event) => setInquiryContent(event.target.value)}
          placeholder="문의 내용을 자세히 작성해주세요."
          radius="rounded"
          rows={7}
          textareaSize="large"
          value={inquiryContent}
        />
      </div>
      {inquiryStatus === "sent" ? (
        <p className="text_infoSubmitStatus" role="status">
          문의가 접수되었습니다.
        </p>
      ) : null}
      {inquiryStatus === "error" ? (
        <p className="text_infoSubmitStatus is_error" role="alert">
          문의 내용을 확인해주세요.
        </p>
      ) : null}
      <Button
        className="btn_infoSubmit"
        disabled={inquiryStatus === "sending"}
        radius="rounded"
        size="large"
        type="submit"
      >
        <Icon name="submit" />
        {inquiryStatus === "sending" ? "보내는 중" : "문의하기"}
      </Button>
    </form>
  );
}
