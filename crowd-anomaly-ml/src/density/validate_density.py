import cv2
import os
import sys
import argparse

# Add src to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from detection.person_detector import PersonDetector
from density.density_analyzer import DensityAnalyzer
from density.heatmap_generator import HeatmapGenerator

def validate_on_shanghaitech(dataset_path):
    """
    Validates the crowd counting and density analysis on ShanghaiTech images.
    """
    detector = PersonDetector()
    analyzer = DensityAnalyzer()
    heatmap_gen = HeatmapGenerator()

    # ShanghaiTech structure usually has part_A/test_data/images
    # Adjust this path based on your extraction
    image_folder = os.path.join(dataset_path, 'test_data', 'images')
    
    if not os.path.exists(image_folder):
        print(f"❌ Error: Image folder not found at {image_folder}")
        return

    images = [f for f in os.listdir(image_folder) if f.endswith(('.jpg', '.png'))]
    print(f"📂 Found {len(images)} images in ShanghaiTech dataset.")

    for img_name in images:
        img_path = os.path.join(image_folder, img_name)
        frame = cv2.imread(img_path)
        
        if frame is None:
            continue

        # Process
        detections = detector.detect_people(frame)
        count_data = detector.count_people(frame)
        density_data = analyzer.analyze_density(frame.shape, detections)
        
        # Visualize
        viz_frame = heatmap_gen.generate_heatmap(frame.copy(), detections)
        viz_frame = detector.draw_boxes(viz_frame, detections)
        
        # Overlay Info
        cv2.putText(viz_frame, f"Count: {count_data['people_count']}", (20, 40), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.putText(viz_frame, f"Risk: {density_data['risk_level']}", (20, 80), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

        cv2.imshow('ShanghaiTech Validation', viz_frame)
        print(f"Image: {img_name} | Count: {count_data['people_count']} | Risk: {density_data['risk_level']}")
        
        if cv2.waitKey(0) & 0xFF == ord('q'):
            break

    cv2.destroyAllWindows()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--path", type=str, required=True, help="Path to ShanghaiTech part_A or part_B folder")
    args = parser.parse_args()
    
    validate_on_shanghaitech(args.path)
