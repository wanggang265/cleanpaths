# p2_hygiene_1 production assertions (2026-11-27, deploy f7848cd8)
== A. new-3-pages SSR lang ==
png-para-dxf: <html lang="pt-BR" HTTP200
jpg-para-dxf: <html lang="pt-BR" HTTP200
svg-para-dxf: <html lang="pt-BR" HTTP200
== B. untouched pages ==
jfif-para-jpg: <html lang="pt-BR"
hub: <html lang="pt-BR"
== E. EN spot checks (red line) ==
home: <html lang="en">; png-to-dxf: <html lang="en">; pricing: <html lang="en">
== C/D. llms.txt PT count = 16 (5518B); feedback endpoint 400 invalid_json (Functions bundle alive) ==
