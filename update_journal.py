import sys

def main():
    if len(sys.argv) < 3:
        print("Usage: python update_journal.py <title> <learning> <action>")
        return

    title = sys.argv[1]
    learning = sys.argv[2]
    action = sys.argv[3]

    entry = f"""
## 2024-07-04 - {title}
**Learning:** {learning}
**Action:** {action}
"""
    try:
        with open('.jules/bolt.md', 'a') as f:
            f.write(entry)
        print("Successfully updated journal.")
    except Exception as e:
        print(f"Failed to update journal: {e}")

if __name__ == "__main__":
    main()
