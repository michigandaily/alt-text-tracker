import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { JSDOM } from "jsdom";
import { csvFormat, csvParse } from "d3-dsv";
import { eachLimit } from "async";

const main = async () => {
  let after = "2022-12-01T00:00:00-05:00";
  let offset = 0;
  const size = 10;

  let previous = Array();

  if (existsSync("./data.csv")) {
    console.log("Reading previous data...");
    previous = csvParse(readFileSync("./data.csv").toString());
    after = `${previous.at(-1).date}T00:00:00-05:00`;
  }

  const imgs = new Map();
  const imgs_with_alt = new Map();

  if (previous.length > 0) {
    previous.forEach(({ date, images_published, images_published_with_alt_text }) => {
      imgs.set(date, +images_published);
      imgs_with_alt.set(date, +images_published_with_alt_text);
    });

    imgs.set(previous.at(-1).date, 0);
    imgs_with_alt.set(previous.at(-1).date, 0);
  }

  const url = new URL("https://www.michigandaily.com/wp-json/wp/v2/posts");
  url.searchParams.set("after", after);
  url.searchParams.set("offset", offset);

  let response = await fetch(url.href);
  let posts = await response.json();

  while (response.ok && posts.length > 0) {
    console.log(`Reading posts from ${url.href}...`);
    await eachLimit(posts, size, async (post) => {
      const [date] = post.date.split("T");

      if (!imgs.has(date)) {
        imgs.set(date, 0);
      }
      if (!imgs_with_alt.has(date)) {
        imgs_with_alt.set(date, 0);
      }

      const feature = post._links["wp:featuredmedia"]?.at(0);
      if (feature && feature.href) {
        const _image_response = await fetch(feature.href);
        if (_image_response.ok) {
          const _image_data = await _image_response.json();
          imgs.set(date, imgs.get(date) + 1);
          if (_image_data.alt_text.length > 0) {
            imgs_with_alt.set(date, imgs_with_alt.get(date) + 1);
          }
        } else {
          console.error(_image_response.status, _image_response.statusText);
        }
      }

      const body = new JSDOM(post.content.rendered).window.document.body;
      const images = Array.from(body.querySelectorAll("img"));
      if (images.length > 0) {
        imgs.set(date, imgs.get(date) + images.length);
        imgs_with_alt.set(date, imgs_with_alt.get(date) + images.filter(image => image.alt.length > 0).length);
      }
    });

    url.searchParams.set("offset", +url.searchParams.get("offset") + size);
    response = await fetch(url.href);
    if (!response.ok) {
      console.error(response.status, response.statusText);
      break;
    } else {
      posts = await response.json();
    }
  }

  const data = Array.from(imgs)
    .map(([k, v]) => ({ date: k, images_published: v, images_published_with_alt_text: imgs_with_alt.get(k) }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const total_images = data.map(d => d.images_published).reduce((sum, addend) => sum + addend, 0);
  const total_images_with_alt_text = data.map(d => d.images_published_with_alt_text).reduce((sum, addend) => sum + addend, 0);
  console.log({ total_images_with_alt_text, total_images, percentage: total_images_with_alt_text / total_images * 100 })
  writeFileSync("./data.csv", csvFormat(data));
}

main();
