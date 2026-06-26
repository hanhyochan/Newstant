"use client";

import { useState } from "react";

type InlineTextEditId = number | string;

function getInlineTextEditKey(id: InlineTextEditId) {
  return String(id);
}

export function useInlineTextEdit<TId extends InlineTextEditId>() {
  const [draft, setDraft] = useState("");
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<TId | null>(null);

  function beginEdit(id: TId, value: string) {
    setEditingId(id);
    setDraft(value);
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft("");
  }

  function saveEdit() {
    if (editingId === null) {
      return false;
    }

    const value = draft.trim();

    if (!value) {
      return false;
    }

    setEditedValues((currentValues) => ({
      ...currentValues,
      [getInlineTextEditKey(editingId)]: value,
    }));
    cancelEdit();

    return true;
  }

  function clearEdit(id: TId) {
    if (editingId === id) {
      cancelEdit();
    }

    setEditedValues((currentValues) => {
      const { [getInlineTextEditKey(id)]: _removedValue, ...nextValues } =
        currentValues;

      return nextValues;
    });
  }

  function getEditedValue(id: TId) {
    return editedValues[getInlineTextEditKey(id)];
  }

  return {
    beginEdit,
    cancelEdit,
    clearEdit,
    draft,
    editedValues,
    editingId,
    getEditedValue,
    saveEdit,
    setDraft,
  };
}
