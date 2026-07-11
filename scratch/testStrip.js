const stripHtml = (value) => {
  if (!value) return '';
  let s = value.replace(/<img[\s\S]*?(>|$)/ig, '');
  s = s.replace(/<[^>]*>/g, '');
  return s.replace(/&nbsp;/g, ' ').trim();
}

const test1 = 'Data Protection<img src="data:image/jpeg;base64,/9j/4AAQSkZJRgAB';
const test2 = 'Data Protection<img src="data:image/jpeg;base64,/9j/4AAQSkZJRgAB">';
const test3 = '<p>Data Protection</p><img src="test">';

console.log(stripHtml(test1)); // Expected: "Data Protection"
console.log(stripHtml(test2)); // Expected: "Data Protection"
console.log(stripHtml(test3)); // Expected: "Data Protection"
