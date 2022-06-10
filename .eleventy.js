const dayjs = require('dayjs');
const pluginRss = require('@11ty/eleventy-plugin-rss');

const sortPostsByDate = (posts) =>
  posts.sort((a, b) => {
    const dayA = dayjs(a.data.day);
    const dayB = dayjs(b.data.day);
    if (dayA.diff(dayB) < 0) {
      return 1;
    } else if (dayA.diff(dayB) > 0) {
      return -1;
    }
    return 0;
  });

module.exports = function (eleventyConfig) {
  /* Filters */
  eleventyConfig.addFilter('getFirst', (value) => {
    return value.slice(0, 1);
  });

  eleventyConfig.addFilter('getFive', (value) => {
    return value.slice(0, 5);
  });

  eleventyConfig.addFilter('log', (value) => {
    console.log(value);
  });

  eleventyConfig.addFilter('readableDate', (dateObj) => {
    return dayjs(dateObj).format('MMMM D, YYYY');
  });

  eleventyConfig.addFilter('sortByDate', (values) => {
    const sortedValues = sortPostsByDate(values);
    return sortedValues;
  });

  /* Copy all folder contents from src to public */
  eleventyConfig.addPassthroughCopy('src/_img');
  eleventyConfig.addPassthroughCopy('src/_js');
  eleventyConfig.addPassthroughCopy('src/_css');

  /* Trigger a browser refresh when the css file changes */
  eleventyConfig.setBrowserSyncConfig({
    files: './_site/css/**/*.css',
  });

  /* Plugins */
  eleventyConfig.addPlugin(pluginRss);

  /* Config */
  return {
    dir: {
      input: 'src',
      output: 'public',
    },
  };
};
