import { useState, useCallback, useMemo } from 'react';
import type { SlashCommand } from '../types';

interface UseSlashCommandsOptions {
  commands: SlashCommand[];
  onSelect?: (command: SlashCommand) => void;
}

interface UseSlashCommandsReturn {
  isOpen: boolean;
  query: string;
  filteredCommands: SlashCommand[];
  selectedIndex: number;
  /** Call this on every input change. Returns the cleaned text (without the slash query). */
  handleInputChange: (text: string) => { showMenu: boolean; cleanText: string };
  /** Handle keyboard navigation (ArrowUp, ArrowDown, Enter, Escape) */
  handleKeyDown: (e: React.KeyboardEvent) => boolean;
  /** Select a specific command */
  selectCommand: (command: SlashCommand) => void;
  /** Close the menu */
  close: () => void;
}

/**
 * Headless hook for slash command detection, filtering, and keyboard navigation.
 */
export const useSlashCommands = ({
  commands,
  onSelect,
}: UseSlashCommandsOptions): UseSlashCommandsReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCommands = useMemo(() => {
    if (!query) return commands;
    const lower = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.shortcut.toLowerCase().includes(lower) ||
        cmd.label.toLowerCase().includes(lower)
    );
  }, [commands, query]);

  const handleInputChange = useCallback(
    (text: string): { showMenu: boolean; cleanText: string } => {
      // Detect if the user is typing a slash command at the start of the line
      const match = text.match(/^\/(\S*)$/);
      if (match) {
        setQuery(match[1]);
        setIsOpen(true);
        setSelectedIndex(0);
        return { showMenu: true, cleanText: text };
      }
      
      setIsOpen(false);
      setQuery('');
      return { showMenu: false, cleanText: text };
    },
    []
  );

  const selectCommand = useCallback(
    (command: SlashCommand) => {
      setIsOpen(false);
      setQuery('');
      onSelect?.(command);
    },
    [onSelect]
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent): boolean => {
      if (!isOpen || filteredCommands.length === 0) return false;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
          return true;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
          return true;
        case 'Enter':
        case 'Tab':
          e.preventDefault();
          selectCommand(filteredCommands[selectedIndex]);
          return true;
        case 'Escape':
          e.preventDefault();
          close();
          return true;
        default:
          return false;
      }
    },
    [isOpen, filteredCommands, selectedIndex, selectCommand, close]
  );

  return {
    isOpen,
    query,
    filteredCommands,
    selectedIndex,
    handleInputChange,
    handleKeyDown,
    selectCommand,
    close,
  };
};
