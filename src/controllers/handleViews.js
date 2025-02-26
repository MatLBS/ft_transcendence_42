export const displayIndex = (req, res) => {
	return res.view('index.ejs')
}

export const displayAbout = (req, res) => {
	return res.view('about.ejs', {name: "Mateo"})
}