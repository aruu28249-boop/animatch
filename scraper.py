import requests
from bs4 import BeautifulSoup
import json
import time

# Top 20 anime to scrape
ANIME_LIST = [
    "naruto",
    "naruto-shippuden",
    "bleach",
    "one-piece",
    "dragon-ball-z",
    "boruto-naruto-next-generations",
    "fairy-tail",
    "sword-art-online",
    "inuyasha",
    "yu-yu-hakusho",
    "hunter-x-hunter-2011",
    "fullmetal-alchemist",
    "soul-eater",
    "black-clover",
    "my-hero-academia",
    "pokemon",
    "dragon-ball-super",
    "one-piece-film",
    "shaman-king-2001",
    "rurouni-kenshin",
]

BASE_URL = "https://www.animefillerlist.com/shows"

def scrape_anime(slug):
    url = f"{BASE_URL}/{slug}"
    print(f"Scraping: {url}")

    try:
        res = requests.get(url, timeout=10, headers={
            "User-Agent": "Mozilla/5.0"
        })

        if res.status_code != 200:
            print(f"  ✗ Failed ({res.status_code})")
            return None

        soup = BeautifulSoup(res.text, 'html.parser')

        # get anime title
        title_el = soup.find('h1')
        title    = title_el.text.strip() if title_el else slug.replace('-', ' ').title()

        # find episode table
        episodes    = []
        filler_eps  = []
        canon_eps   = []
        mixed_eps   = []

        rows = soup.select('table.EpisodeList tr')

        for row in rows:
            cells = row.find_all('td')
            if len(cells) < 3:
                continue

            ep_num  = cells[0].text.strip()
            ep_type = cells[2].text.strip().lower()

            if not ep_num.isdigit():
                continue

            ep_num = int(ep_num)
            episodes.append(ep_num)

            if 'filler' in ep_type and 'mixed' not in ep_type:
                filler_eps.append(ep_num)
            elif 'mixed' in ep_type:
                mixed_eps.append(ep_num)
            else:
                canon_eps.append(ep_num)

        if not episodes:
            print(f"  ✗ No episodes found")
            return None

        total        = len(episodes)
        filler_count = len(filler_eps)
        filler_pct   = round((filler_count / total) * 100) if total > 0 else 0

        print(f"  ✓ {title} — {total} eps, {filler_count} fillers ({filler_pct}%)")

        return {
            "title":      title,
            "slug":       slug,
            "total":      total,
            "fillerEps":  filler_eps,
            "mixedEps":   mixed_eps,
            "canonEps":   canon_eps,
            "fillerCount":filler_count,
            "fillerPct":  filler_pct,
        }

    except Exception as e:
        print(f"  ✗ Error: {e}")
        return None


def main():
    result = {}

    for slug in ANIME_LIST:
        data = scrape_anime(slug)
        if data:
            result[slug] = data
        # be polite to the server — wait between requests
        time.sleep(2)

    # save to data folder
    import os
    os.makedirs('data', exist_ok=True)

    with open('data/fillers.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Done! Saved {len(result)} anime to data/fillers.json")


if __name__ == "__main__":
    main()