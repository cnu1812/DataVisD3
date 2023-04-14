library(jsonlite)
library(rayshader)

# Load JSON data into R
data <- fromJSON("data.json")

# Extract matrix from list
data_matrix <- as.matrix(data$data)

# Create elevation matrix from data matrix
elevation_matrix <- apply(data_matrix, 1, function(x) {rev(x)})

# Load the imhof4 texture
texture_file <- system.file("extdata/textures/imhof4.png", package="rayshader")
imhof4 <- png::readPNG(texture_file)

# Normalize the texture
imhof4 <- imhof4[,,1] # Select only the red channel
imhof4 <- scale(imhof4, center = FALSE, scale = max(imhof4, na.rm = TRUE))

# Create 3D plot
plot_map(elevation_matrix)

# Add texture using add_overlay()
add_overlay(imhof4, alphalayer = 0.5)

# Render the plot
render_camera(theta = 45, phi = 30, zoom = 0.5, windowsize = c(800, 600))

