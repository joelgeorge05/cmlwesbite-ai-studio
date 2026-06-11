import json
import requests
import PyPDF2
import re

pdf_path = 'Mekhala-Kala-Malsarangal-formatted.pdf'

# Extract text from PDF
pdf = PyPDF2.PdfReader(pdf_path)
full_text = ""
for page in pdf.pages:
    full_text += page.extract_text() + "\n"

# Parse using the server's regex pattern
regex = r'(?:^|\n)\s*(\d+)\.\s+(.+?)\s+(Sub Junior|Junior|Senior|Super Senior|Group Items)\s+(.+?)\s+(\d{4}-\d{2}-\d{2})\s+(KYR\d+)'

participants = []
for match in re.finditer(regex, full_text):
    rawName = match.group(4).replace('\n', ' ').strip()
    parts = rawName.split(',')
    name = parts[0].strip()
    houseName = parts[1].strip() if len(parts) > 1 else ''
    cmlId = match.group(6).strip()
    shakhaId = cmlId[:5]  # e.g., KYR02
    
    participants.append({
        'id': f'reg_temp_{len(participants)}',
        'eventName': match.group(2).replace('\n', ' ').strip(),
        'section': match.group(3).strip(),
        'competitorName': name,
        'houseName': houseName,
        'dob': match.group(5).strip(),
        'cmlId': cmlId,
        'shakhaId': shakhaId
    })

print(f"Extracted {len(participants)} participants")

# Load current database
try:
    with open('db.json', 'r', encoding='utf-8') as f:
        db = json.load(f)
except:
    db = {
        "announcements": [],
        "news": [],
        "officeBearers": [],
        "units": [],
        "events": [],
        "galleryAlbums": [],
        "galleryImages": [],
        "downloads": [],
        "logs": [],
        "results": [],
        "registrations": [],
        "competitionStatuses": {}
    }

# Add new participants (avoid duplicates)
newCount = 0
for p in participants:
    existing = next((r for r in db.get('registrations', []) 
                    if r.get('cmlId') == p['cmlId'] and r.get('eventName') == p['eventName']), None)
    if not existing:
        db['registrations'].append(p)
        newCount += 1

print(f"Added {newCount} new registrations (total now: {len(db.get('registrations', []))})")

# Save database
with open('db.json', 'w', encoding='utf-8') as f:
    json.dump(db, f, indent=2, ensure_ascii=False)

print("✓ Database updated successfully!")
