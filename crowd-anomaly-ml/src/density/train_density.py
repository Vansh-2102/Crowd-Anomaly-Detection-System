import os
import sys
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
import cv2
import numpy as np

# Add src to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from density.model import CSRNet
import torch.optim as optim
from torchvision import transforms
from PIL import Image

class ShanghaiTechDataset(Dataset):
    def __init__(self, root_path, part='part_A', mode='train', transform=None):
        self.root = os.path.join(root_path, part, mode + '_data', 'images')
        self.gt_root = os.path.join(root_path, part, mode + '_data', 'ground-truth')
        if not os.path.exists(self.root):
            # Try without the part folder if it's already in the root
            self.root = os.path.join(root_path, mode + '_data', 'images')
            self.gt_root = os.path.join(root_path, mode + '_data', 'ground-truth')
            
        if os.path.exists(self.root):
            self.img_names = [f for f in os.listdir(self.root) if f.endswith('.jpg')]
        else:
            self.img_names = []
        self.transform = transform

    def __len__(self):
        return len(self.img_names)

    def __getitem__(self, index):
        img_name = self.img_names[index]
        img_path = os.path.join(self.root, img_name)
        img = Image.open(img_path).convert('RGB')
        
        # In a real implementation, you would load the .mat files and generate density maps
        # For this setup, we assume you have pre-generated density maps or we use a simplified count
        # Here we just return the image and a dummy target for the script structure
        if self.transform:
            img = self.transform(img)
            
        return img, torch.zeros((1, img.shape[1]//8, img.shape[2]//8)) # Dummy target

def train_density_model(dataset_path, start_epoch=0):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Checking GPU... Device: {device}")
    if device.type == 'cuda':
        print(f"GPU Name: {torch.cuda.get_device_name(0)}")
        print(f"Memory Allocated: {torch.cuda.memory_allocated(0)/1024**2:.2f} MB")

    print("Loading model architecture...")
    model = CSRNet().to(device)
    
    save_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'models', 'trained_models')
    os.makedirs(save_dir, exist_ok=True)
    save_path = os.path.join(save_dir, 'density_model.pth')

    # Resume logic
    if os.path.exists(save_path) and start_epoch > 0:
        print(f"Loading weights from {save_path} to resume training...")
        try:
            model.load_state_dict(torch.load(save_path))
            print("Weights loaded successfully.")
        except Exception as e:
            print(f"Error loading weights: {e}. Starting from scratch.")
    
    print("Model ready on device.")
    
    criterion = nn.MSELoss(reduction='sum').to(device)
    optimizer = optim.Adam(model.parameters(), lr=1e-5)
    
    # Resize images to a fixed size to allow batching
    target_size = (512, 640) # Smaller size for faster training and less VRAM
    print(f"Setting target image size to: {target_size}")
    
    transform = transforms.Compose([
        transforms.Resize(target_size),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    
    print(f"Loading dataset from: {dataset_path}")
    train_dataset = ShanghaiTechDataset(dataset_path, part='part_A', mode='train', transform=transform)
    
    if len(train_dataset) == 0:
        print(f"Error: No images found in {dataset_path}")
        return

    # num_workers=0 is best for Windows to avoid multiprocess hangs
    batch_size = 2 
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0)

    print(f"Starting training loop from epoch {start_epoch}... Images: {len(train_dataset)}, Batch Size: {batch_size}")
    
    model.train()
    for epoch in range(start_epoch, 50):
        epoch_loss = 0
        for i, (img, target) in enumerate(train_loader):
            img = img.to(device)
            target = target.to(device)
            
            optimizer.zero_grad()
            output = model(img)
            
            if output.shape != target.shape:
                target = torch.nn.functional.interpolate(target, size=(output.shape[2], output.shape[3]), mode='bilinear', align_corners=False)

            loss = criterion(output, target)
            loss.backward()
            optimizer.step()
            
            epoch_loss += loss.item()
            
            if i % 5 == 0: # Print more frequently to show it's working
                print(f"Epoch {epoch+1} | Batch {i}/{len(train_loader)} | Loss: {loss.item():.4f} | GPU VRAM: {torch.cuda.memory_reserved(0)/1024**2:.2f}MB")
        
        avg_loss = epoch_loss / len(train_dataset)
        print(f"--- Epoch {epoch+1} Complete | Avg Loss: {avg_loss:.4f} ---")
        
        torch.save(model.state_dict(), save_path)
        print(f"Model saved to {save_path}")

if __name__ == "__main__":
    print("--- Starting Density Training Script ---")
    # Get absolute path to datasets folder
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    path = os.path.join(base_dir, 'datasets', 'ShanghaiTech')
    
    if os.path.exists(path):
        save_path = os.path.join(base_dir, 'models', 'trained_models', 'density_model.pth')
        start_epoch = 0
        if os.path.exists(save_path):
            try:
                val = input(f"Existing model found. Enter the epoch to resume from (or press Enter for 0): ")
                if val.strip():
                    start_epoch = int(val)
            except (EOFError, ValueError):
                start_epoch = 0
        
        train_density_model(path, start_epoch=start_epoch)
    else:
        print(f"Dataset not found at {path}")
