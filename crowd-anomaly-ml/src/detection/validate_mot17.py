import cv2
import os
import sys
import argparse

# Add src to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from detection.person_detector import PersonDetector

def validate_mot17_tracking(dataset_path):
    """
    Validates YOLOv8 tracking on MOT17 sequences.
    """
    detector = PersonDetector()
    
    # Check for MOT17 sequences in test or train folders
    subfolders = ['test', 'train']
    found_sequences = []
    
    for sub in subfolders:
        base_path = os.path.join(dataset_path, 'MOT17', sub)
        if os.path.exists(base_path):
            sequences = [d for d in os.listdir(base_path) if os.path.isdir(os.path.join(base_path, d))]
            for seq in sequences:
                found_sequences.append(os.path.join(base_path, seq))
    
    if not found_sequences:
        print(f"Error: No MOT17 sequences found in {dataset_path}")
        return

    print(f"Found {len(found_sequences)} MOT17 sequences.")

    for seq_path in found_sequences:
        seq_name = os.path.basename(seq_path)
        img_folder = os.path.join(seq_path, 'img1')
        
        if not os.path.exists(img_folder):
            continue
            
        print(f"Processing sequence: {seq_name}")
        images = sorted([f for f in os.listdir(img_folder) if f.endswith('.jpg')])
        
        for img_name in images:
            img_path = os.path.join(img_folder, img_name)
            frame = cv2.imread(img_path)
            
            if frame is None:
                continue

            # Process with tracking enabled
            detections = detector.detect_people(frame, track=True)
            
            # Visualize
            viz_frame = detector.draw_boxes(frame.copy(), detections)
            
            cv2.putText(viz_frame, f"Seq: {seq_name}", (20, 40), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
            cv2.putText(viz_frame, f"Tracking Active", (20, 80), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

            cv2.imshow('MOT17 Tracking Validation', viz_frame)
            
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                cv2.destroyAllWindows()
                return
            elif key == ord('s'): # Skip to next sequence
                break

    cv2.destroyAllWindows()

if __name__ == "__main__":
    print("--- Starting MOT17 Tracking Validation ---")
    parser = argparse.ArgumentParser()
    # Adjust default path based on where MOT17 is unzipped
    parser.add_argument("--path", type=str, required=True, help="Path to MOT17 root folder")
    args = parser.parse_args()
    
    validate_mot17_tracking(args.path)
