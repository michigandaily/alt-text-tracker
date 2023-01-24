import { writeFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { csvFormat } from "d3-dsv";

const main = async () => {
  let offset = 0;
  const size = 10;

  const url = new URL("https://www.michigandaily.com/wp-json/wp/v2/posts");
  url.searchParams.set("after", "2022-12-01T00:00:00Z");
  url.searchParams.set("offset", offset);

  let response = await fetch(url.href);
  let posts = await response.json();

  let imgs = new Map();
  let imgs_with_alt = new Map();
  while (response.ok && posts.length > 0) {
    posts.forEach(async (post) => {
      const [date] = post.date.split("T");

      if (!imgs.has(date)) {
        imgs.set(date, 0);
      }
      if (!imgs_with_alt.has(date)) {
        imgs_with_alt.set(date, 0);
      }
      const feature = post._links["wp:featuredmedia"].pop();
      if (feature && feature.href) {
        const _image_response = await fetch(feature.href);
        if (_image_response.ok) {
          const _image_data = await _image_response.json();
          imgs.set(date, imgs.get(date) + 1);
          if (_image_data.alt_text.length > 0) {
            imgs_with_alt.set(date, imgs_with_alt.get(date) + 1);
          }
        }
      }
      const body = new JSDOM(post.content.rendered).window.document.body;
      const images = Array.from(body.querySelectorAll("img"));
      if (images.length > 0) {
        imgs.set(date, imgs.get(date) + images.length);
        imgs_with_alt.set(date, imgs_with_alt.get(date) + images.filter(image => image.alt.length > 0).length);
      }
    })

    url.searchParams.set("offset", +url.searchParams.get("offset") + size);
    response = await fetch(url.href);
    if (!response.ok) {
      console.error(response.status, response.statusText);
      break;
    } else {
      posts = await response.json();
    }
  }

  const data = Array.from(imgs).map(([k, v]) => ({ date: k, images: v, images_with_alt_text: imgs_with_alt.get(k) }));

  const total_images = data.map(d => d.images).reduce((sum, addend) => sum + addend, 0);
  const total_images_with_alt_text = data.map(d => d.images_with_alt_text).reduce((sum, addend) => sum + addend, 0);
  console.log({ total_images_with_alt_text, total_images, percentage: total_images_with_alt_text / total_images * 100 })
  writeFileSync("./data.csv", csvFormat(data));
}

main();
