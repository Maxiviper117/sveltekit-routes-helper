Here is a **full step-by-step guide** to using **Changesets** in a project with `main` and `dev` branches. This guide includes **branching, versioning, publishing, and syncing**.

---

## **🔹 Workflow Overview**
1. **Feature development on `dev`**  
2. **Use Changesets to track changes**  
3. **Merge `dev` → `main`**  
4. **Version & publish the package from `main`**  
5. **Sync `main` back to `dev`**  

---

## **🔹 Step-by-Step Guide**

### **1️⃣ Setup Changesets in Your Project**
If you haven't already installed Changesets, run:
```bash
pnpm add -D @changesets/cli
```

Initialize Changesets:
```bash
pnpm changeset init
```
🔹 This creates a `.changeset/` directory.

---

### **2️⃣ Start a New Feature (on `dev`)**
#### **Create a feature branch**
```bash
git checkout dev
git pull origin dev  # Ensure dev is up to date
git checkout -b feature-xyz  # Create a new feature branch
```

#### **Make changes & add a Changeset**
```bash
pnpm run changeset
```
- Select the package(s) to update.
- Choose **patch**, **minor**, or **major** version bump.
- Add a short message about the change.

🔹 This creates a new `.changeset/*.md` file.

#### **Commit and Push**
```bash
git add .
git commit -m "Added changeset for feature XYZ"
git push origin feature-xyz
```

#### **Open a Pull Request (PR) from `feature-xyz` → `dev`**
- Merge after review.

---

### **3️⃣ Merge `dev` → `main` and Version the Package**
Once all features are merged into `dev`, prepare a release.

#### **Create a PR from `dev` → `main`**
- Ensure all changesets are in `dev`.
- Open a PR **from `dev` → `main`**.

#### **Update versions before merging**
```bash
git checkout main
git pull origin main
git merge dev
pnpm run changeset:version
```
🔹 **This will:**
- Update `package.json` versions.
- Create/update `CHANGELOG.md`.

#### **Commit the version bump**
```bash
git add .
git commit -m "Version bump for release"
git push origin main
```

#### **Merge PR into `main`.**
After merging, `main` now has the **new version**.

---

### **4️⃣ Publish the Package**
#### **Run Publish Command**
```bash
pnpm run changeset:publish
```
🔹 This will:
- Publish the package to npm.
- Create a **Git tag** (e.g., `v1.2.3`).
- Push the tag to GitHub.

---

### **5️⃣ Sync `main` Back to `dev`**
After publishing, ensure `dev` is **up to date**:
```bash
git checkout dev
git pull origin main  # Sync dev with main
git push origin dev
```

Now `dev` has the new **package version** and is ready for the next cycle. 🚀

---

## **🎯 Final Summary**
| Step | Branch        | Action                                            |
| ---- | ------------- | ------------------------------------------------- |
| 1    | `feature-xyz` | Create feature, run `changeset`, open PR to `dev` |
| 2    | `dev`         | Merge feature branches, open PR to `main`         |
| 3    | `main`        | Run `changeset:version`, commit, merge PR         |
| 4    | `main`        | Run `changeset:publish` to release                |
| 5    | `dev`         | Pull latest changes from `main`                   |

---

### **💡 Automate with GitHub Actions?**
Would you like a GitHub Action to **automate publishing** when merging into `main`?  
I can provide a `.github/workflows/release.yml` config for auto-publishing! 🚀