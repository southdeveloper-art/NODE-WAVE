import cv2
import numpy as np

img = cv2.imread('nodewave_logo.png')
img = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
alpha = np.clip((gray.astype(np.float32) - 15) / 45.0, 0, 1) * 255
img[:, :, 3] = alpha.astype(np.uint8)
cv2.imwrite('nodewave_logo.png', img)

