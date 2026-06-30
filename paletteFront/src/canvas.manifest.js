export const manifest = {
  screens: {
    scr_i611gt: { name: "Landing", route: "/", position: { "x": 160, "y": 220 } },
    scr_0e9wn6: { name: "Results", route: "/", state: { "view": "results" }, position: { "x": 1560, "y": 220 } }
  },
  sections: {
    sec_hu4bc0: { name: "Landing & Results", x: 0, y: 0, width: 2920, height: 1180 }
  },
  layers: [
  { kind: "section", id: "sec_hu4bc0", children: [
    { kind: "screen", id: "scr_i611gt" },
    { kind: "screen", id: "scr_0e9wn6" }]
  }]

};